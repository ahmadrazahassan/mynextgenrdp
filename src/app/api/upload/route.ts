import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveMediaItem } from '@/repositories/mediaRepository';
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

// Fallback URL base for cases where the download URL is not properly generated
const FALLBACK_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nextgenweb.vercel.app';

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

// Parse connection string to get account name and key for SAS generation
const getAzureCredentials = () => {
  if (!connectionString) return null;
  
  try {
    // Parse connection string to extract account name and key
    const accountMatch = connectionString.match(/AccountName=([^;]+)/i);
    const keyMatch = connectionString.match(/AccountKey=([^;]+)/i);
    
    if (!accountMatch || !keyMatch) return null;
    
    return {
      accountName: accountMatch[1],
      accountKey: keyMatch[1]
    };
  } catch (error) {
    console.error('Error parsing connection string:', error);
    return null;
  }
};

// Generate SAS URL with read permissions valid for 10 years
const generateSasUrl = (blobName: string) => {
  const credentials = getAzureCredentials();
  if (!credentials) return null;
  
  const sharedKeyCredential = new StorageSharedKeyCredential(
    credentials.accountName,
    credentials.accountKey
  );
  
  // Set SAS token expiry for 10 years from now for long-term access
  const expiryTime = new Date();
  expiryTime.setFullYear(expiryTime.getFullYear() + 10);
  
  const permissions = new BlobSASPermissions();
  permissions.read = true; // Only allow reading
  
  const sasOptions = {
    containerName,
    blobName,
    permissions,
    expiresOn: expiryTime,
  };
  
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();
  
  return `https://${credentials.accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const orderId = formData.get('orderId') as string | null;
    const isOrderScreenshot = formData.get('isOrderScreenshot') as string | null;
    const useAzureStorage = formData.get('useAzureStorage') as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "No userId provided." }, { status: 400 });
    }

    // Basic validation (can be expanded)
    if (file.size > 5 * 1024 * 1024) { // Max 5MB
        return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 413 });
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']; // Added PDF
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` }, { status: 415 });
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Azure should be used:
    // 1. If useAzureStorage=true is explicitly set, use Azure
    // 2. Only use local storage if isOrderScreenshot=true AND useAzureStorage is not true
    // 3. Fallback to local if Azure connection is not configured
    if ((isOrderScreenshot === 'true' && useAzureStorage !== 'true') || !connectionString) {
      try {
        if (isOrderScreenshot === 'true' && !orderId) {
          return NextResponse.json({ error: "Order ID is required for order screenshots." }, { status: 400 });
        }
        
        console.log('Saving file using local storage');
        
        // Generate unique names for local storage
        const fileExtension = file.name.split('.').pop() || 'png';
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const uniqueFolderName = uuidv4();
        
        // Define paths for local storage
        const relativePath = `/uploads/${uniqueFolderName}/${uniqueFileName}`;
        const publicUrl = `${FALLBACK_URL_BASE}${relativePath}`;
        
        // Write to public directory - ensure directories exist
        const publicDir = path.join(process.cwd(), 'public');
        const folderPath = path.join(publicDir, 'uploads', uniqueFolderName);
        const filePath = path.join(folderPath, uniqueFileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        
        // Write the file
        fs.writeFileSync(filePath, buffer);
        
        console.log('File saved successfully to local storage:', { relativePath, publicUrl });
        
        // Save to Media table
        const mediaRecord = await saveMediaItem({
          userId,
          fileName: uniqueFileName,
          fileType: file.type,
          fileSize: file.size,
          path: publicUrl,
          thumbnailPath: publicUrl,
          status: 'approved', // Set as approved right away
          tags: isOrderScreenshot === 'true' ? ['order-screenshot'] : [],
          orderId: orderId || undefined,
          storageType: 'local',
        });
        
        return NextResponse.json({
          success: true,
          message: 'File uploaded successfully to local storage',
          url: publicUrl,
          fileName: uniqueFileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          media: mediaRecord,
          storageType: 'local'
        }, { status: 201 });
      } catch (error: any) {
        console.error("Local storage error:", error);
        return NextResponse.json({ 
          error: "Failed to save file to local storage.", 
          details: error.message 
        }, { status: 500 });
      }
    } else {
      // For non-order uploads when Azure is configured, use Azure as before
      try {
        console.log('Uploading file to Azure Blob Storage');
        
        // Initialize Azure Blob client
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Don't try to set public access anymore - just make sure container exists
        const containerExists = await containerClient.exists();
        if (!containerExists) {
          await containerClient.create();
          console.log(`Container "${containerName}" created successfully.`);
        }
        
        // Create unique filename
        const originalFileName = file.name;
        const fileExtension = originalFileName.split('.').pop() || '';
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        
        // Create folder structure virtually (as part of the blob name)
        const uniqueFolderName = uuidv4();
        const blobName = `${uniqueFolderName}/${uniqueFileName}`;
        
        // Upload the file to Azure Blob Storage
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(buffer, buffer.length);
        
        // Generate SAS URL with read permission instead of using public blob URL
        const sasUrl = generateSasUrl(blobName);
        
        // If SAS generation fails, throw error
        if (!sasUrl) {
          throw new Error("Failed to generate secure access URL for the file");
        }

        // Save to Media table with the SAS URL
        let mediaRecord = null;
        try {
          mediaRecord = await saveMediaItem({
            userId,
            fileName: uniqueFileName,
            fileType: file.type,
            fileSize: file.size,
            path: sasUrl,
            thumbnailPath: sasUrl, // You can generate a real thumbnail if needed
            status: 'pending', // Default status
            tags: [], // Add tags if needed
            orderId: orderId || undefined,
            storageType: 'azure',
          });
        } catch (dbError: any) {
          console.error('Error saving media record:', dbError);
          return NextResponse.json({ error: 'Failed to save media record.', details: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'File uploaded and media record saved successfully', 
            url: sasUrl,
            fileName: uniqueFileName, // The new name of the file on the server
            originalName: originalFileName, // The original name of the file from the client
            size: file.size,
            type: file.type,
            media: mediaRecord,
            storageType: 'azure'
        }, { status: 201 });
      } catch (uploadError: any) {
        console.error("Azure upload error:", uploadError);
        
        // Fallback to local storage if Azure fails
        try {
          console.log('Falling back to local storage');
          
          // Generate unique names for local storage
          const fileExtension = file.name.split('.').pop() || 'png';
          const uniqueFileName = `${uuidv4()}.${fileExtension}`;
          const uniqueFolderName = uuidv4();
          
          // Define paths for local storage
          const relativePath = `/uploads/${uniqueFolderName}/${uniqueFileName}`;
          const publicUrl = `${FALLBACK_URL_BASE}${relativePath}`;
          
          // Write to public directory
          const publicDir = path.join(process.cwd(), 'public');
          const folderPath = path.join(publicDir, 'uploads', uniqueFolderName);
          const filePath = path.join(folderPath, uniqueFileName);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
          }
          
          // Write the file
          fs.writeFileSync(filePath, buffer);
          
          // Save to Media table
          const mediaRecord = await saveMediaItem({
            userId,
            fileName: uniqueFileName,
            fileType: file.type,
            fileSize: file.size,
            path: publicUrl,
            thumbnailPath: publicUrl,
            status: 'pending',
            tags: ['fallback-storage'],
            orderId: orderId || undefined,
            storageType: 'local',
          });
          
          return NextResponse.json({
            success: true,
            message: 'File uploaded to local storage (Azure fallback)',
            url: publicUrl,
            fileName: uniqueFileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            media: mediaRecord,
            storageType: 'local'
          }, { status: 201 });
        } catch (fallbackError: any) {
          console.error("Fallback storage error:", fallbackError);
          return NextResponse.json({ 
            error: "Failed to upload file to both Azure and fallback storage.", 
            details: `${uploadError.message}; Fallback error: ${fallbackError.message}` 
          }, { status: 500 });
        }
      }
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    // Distinguish between client errors and server errors if possible
    if (error.message && (error.message.includes("File type") || error.message.includes("File size"))) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred during file upload.", details: error.message }, { status: 500 });
  }
} 