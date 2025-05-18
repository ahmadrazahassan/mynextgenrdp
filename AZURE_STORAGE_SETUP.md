# Azure Blob Storage Setup Guide

This guide will help you set up Azure Blob Storage for screenshot uploads in your application.

## 1. Create an Azure Storage Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Storage accounts" and click "Create"
3. Fill in the required details:
   - Subscription: Select your subscription
   - Resource group: Create new or use existing
   - Storage account name: Choose a unique name (e.g., "nextgenwebstorage")
   - Region: Choose a region close to your users
   - Performance: Standard
   - Redundancy: Locally redundant storage (LRS) for cost savings

## 2. Create a Container

After creating the storage account:
1. Navigate to your storage account
2. Go to "Containers" in the left menu
3. Click "+ Container"
4. Name it "uploads" (or whatever you prefer)
5. Set "Public access level" to "Container" or "Blob" (if you want public access)
   - Note: If you set it to "Private", the app will use SAS tokens automatically

## 3. Get Connection String

1. In your storage account, go to "Access keys" in the left menu
2. Click "Show keys"
3. Copy the "Connection string" for key1 or key2

## 4. Configure Environment Variables

Add the following to your `.env.local` file:

```
AZURE_STORAGE_CONNECTION_STRING="your-connection-string-from-azure-portal"
AZURE_STORAGE_CONTAINER_NAME="uploads"
```

Or set them using your command line:

### For Windows PowerShell:
```
$env:AZURE_STORAGE_CONNECTION_STRING="your-connection-string-from-azure-portal"
$env:AZURE_STORAGE_CONTAINER_NAME="uploads"
```

### For Windows Command Prompt:
```
set AZURE_STORAGE_CONNECTION_STRING="your-connection-string-from-azure-portal"
set AZURE_STORAGE_CONTAINER_NAME="uploads"
```

### For Linux/Mac:
```
export AZURE_STORAGE_CONNECTION_STRING="your-connection-string-from-azure-portal"
export AZURE_STORAGE_CONTAINER_NAME="uploads"
```

## 5. Test Your Configuration

Run the test script to verify your Azure Blob Storage setup:

```
node test-azure-upload.js
```

If successful, you should see confirmation messages and a generated SAS URL.

## 6. Uploading Screenshots

The app now uses Azure Blob Storage for uploads when:
1. AZURE_STORAGE_CONNECTION_STRING is set
2. The upload doesn't have `isOrderScreenshot="true"` (which forces local storage)

For order screenshots, modify the PaymentProofUpload component to remove the `isOrderScreenshot="true"` flag to use Azure storage.

## 7. Troubleshooting

### Public Access Not Permitted Error
If you see "Public access is not permitted on this storage account", there are two solutions:

1. **Enable Public Access on Storage Account**:
   - Go to your storage account in Azure Portal
   - Click "Configuration" in the left menu
   - Set "Allow Blob public access" to "Enabled"
   - Click "Save"

2. **Use SAS Tokens** (Preferred, More Secure):
   - The app now automatically uses SAS tokens if public access is disabled
   - This provides secure, time-limited access to your blobs

### Other Issues

- Check if your connection string is correctly formatted
- Verify you can access the storage account from the Azure Portal
- Check your container exists and has appropriate permissions
- Ensure your firewall settings allow access to Azure Blob Storage

## 8. Management

Upload media can be managed in the Admin Media Page. All images uploaded to Azure will be properly displayed and downloadable in the admin interface. 