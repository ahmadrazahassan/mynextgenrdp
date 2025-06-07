'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, FileText, Image as ImageIcon, RefreshCw, AlertCircle, ArrowUpCircle, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Create a simpler auth hook that doesn't throw if outside context
const useOptionalAuth = () => {
  try {
    // Use dynamic import with a function to avoid bundling issues
    const { useAuth } = require('@/components/providers/AuthProvider');
    return useAuth();
  } catch (error) {
    console.error('Auth provider not available:', error);
    return { user: null, isAuthenticated: false, isLoading: false };
  }
};

interface PaymentProofUploadProps {
  onUploadSuccess?: (url: string, fileName: string) => void;
  onUploadError?: (errorMessage: string) => void;
  uploadedFile?: File | null;
  isLoading?: boolean;
  orderId?: string;
  // Add userId as a prop to work even if auth context is not available
  userId?: string;
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  uploadedFile = null,
  isLoading: externalLoading = false,
  orderId,
  userId: propUserId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(uploadedFile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Use optional auth that won't throw if context is missing
  const { user } = useOptionalAuth();
  
  const isLoading = externalLoading || isUploading;
  
  // Use either context user ID or prop user ID
  const userId = user?.id || propUserId;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndUploadFile(file);
    }
  };

  const uploadToServer = async (file: File) => {
    if (!userId) {
      const errorMsg = "User is not authenticated. Please log in to upload files.";
      toast({
        title: "Authentication required",
        description: errorMsg,
        variant: "destructive",
      });
      if (typeof onUploadError === 'function') {
        onUploadError(errorMsg);
      }
      return null;
    }
    
    setIsUploading(true);
    setUploadProgress(10); // Start progress
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    // Explicitly tell the API to use Azure storage by setting isOrderScreenshot to false
    // Note: When isOrderScreenshot is true, it uses local storage (see route.ts)
    formData.append('isOrderScreenshot', 'false');
    formData.append('useAzureStorage', 'true');
    
    if (orderId) {
      formData.append('orderId', orderId);
    }
    
    try {
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
        });
      }, 300);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      // Short delay to show 100% before completing
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
      return data;
    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      
      if (typeof onUploadError === 'function') {
        onUploadError(error.message || "Upload failed");
      }
      
      return null;
    }
  };

  const validateAndUploadFile = async (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Please upload a PNG, JPEG, or PDF file";
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      if (typeof onUploadError === 'function') {
        onUploadError(errorMsg);
      }
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "File size should be less than 5MB";
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      if (typeof onUploadError === 'function') {
        onUploadError(errorMsg);
      }
      return;
    }
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just clear the preview
      setPreviewUrl(null);
    }
    
    // Upload to server (Azure Blob Storage)
    const uploadResult = await uploadToServer(file);
    
    if (uploadResult) {
      setSelectedFile(file);
      
      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(uploadResult.url, uploadResult.fileName);
      }
      
      const storageTypeText = uploadResult.storageType === 'azure' 
        ? 'Azure Cloud Storage' 
        : 'our servers (local storage)';
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to ${storageTypeText}`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 rounded-xl"
      });
    }
  };

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (typeof onUploadError === 'function') {
      onUploadError("File removed");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-indigo-500" />;
    } else if (selectedFile.type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
        <Upload className="h-5 w-5 mr-2 text-indigo-600" />
        Upload Payment Proof
      </h3>
      <p className="text-sm text-gray-500 mb-5 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1.5 text-amber-500" />
        Upload a screenshot or PDF of your payment confirmation or receipt
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Upload Area */}
        <div className="md:col-span-7">
          <div
            className={`relative overflow-hidden border-2 border-dashed rounded-xl p-6 transition-all duration-200 
              ${isDragging 
                ? 'border-indigo-400 bg-indigo-50/50' 
                : selectedFile 
                  ? 'border-green-300 bg-green-50/50' 
                  : 'border-gray-200 hover:border-indigo-300 bg-gray-50/70 hover:bg-indigo-50/30'
              }
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={!isLoading ? handleDrop : undefined}
            onClick={!isLoading && !selectedFile ? triggerFileInput : undefined}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              disabled={isLoading}
            />
            
            {isUploading && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-100">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center text-center py-4">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-indigo-100 rounded-full mb-3">
                    <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-indigo-700">
                    {isUploading ? 'Uploading to cloud storage...' : 'Processing your upload...'}
                  </p>
                  {isUploading && (
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress < 100 
                        ? `${Math.round(uploadProgress)}% complete`
                        : 'Finalizing upload...'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                </div>
              ) : selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-green-100 rounded-full mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-base font-medium text-green-700">Payment proof uploaded!</p>
                  <div className="flex items-center mt-3 text-sm text-gray-600">
                    {getFileIcon()}
                    <span className="ml-2 font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {e.stopPropagation(); triggerFileInput();}}
                      className="text-xs rounded-full border-gray-300"
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
                      Replace File
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {e.stopPropagation(); handleRemoveFile();}}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full border-gray-300"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full mb-4 border border-indigo-100">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-700">
                    Drag and drop your file here
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    or click to browse from your device
                  </p>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-full text-sm"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Select File
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Accepted formats: PNG, JPEG, PDF</p>
                    <p>Maximum file size: 5MB</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Animated border effect when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 border-2 border-indigo-400 rounded-xl pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(90deg, rgba(129,140,248,0) 0%, rgba(129,140,248,0.1) 50%, rgba(129,140,248,0) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear'
                  }}
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* Additional instructions */}
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mr-2 mt-0.5">
                <Check className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p>Make sure all payment details are clearly visible in your screenshot</p>
            </div>
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mr-2 mt-0.5">
                <Check className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p>Include transaction ID, date, amount, and recipient information</p>
            </div>
            <div className="flex items-start">
              <div className="p-1 bg-indigo-100 rounded-full mr-2 mt-0.5">
                <Cloud className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <p>Your files are securely uploaded to Microsoft Azure Cloud Storage for verification</p>
            </div>
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="md:col-span-5">
          <div className="h-full border rounded-xl overflow-hidden p-4 bg-white/80 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ImageIcon className="h-4 w-4 mr-1.5 text-indigo-500" />
              Preview
            </h4>
            
            <div className="flex items-center justify-center h-[260px] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={previewUrl}
                      alt="Payment proof preview"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-2"
                    />
                  </motion.div>
                ) : selectedFile && selectedFile.type === 'application/pdf' ? (
                  <motion.div
                    key="pdf"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="p-3 bg-red-50 rounded-full mb-3 border border-red-100">
                      <FileText className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">PDF File</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                      {selectedFile.name}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="p-2 bg-gray-100 rounded-full mb-2">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">No preview available</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload an image to see preview
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-700 flex items-center">
                  <Check className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                  Your payment proof is ready to be submitted with your order
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default PaymentProofUpload; 