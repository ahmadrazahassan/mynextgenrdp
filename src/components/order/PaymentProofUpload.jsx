import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, AlertTriangle, X, Image, FileText, Loader } from 'lucide-react';

const PaymentProofUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleFiles = (files) => {
    if (files.length === 0) return;
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    const file = files[0];
    
    // Check file type
    if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
      setError('Please upload an image or PDF file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(file);
    
    // Create preview for images
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just show an icon
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setSuccess(true);
          
          // Call the success callback with simulated response
          if (onUploadSuccess) {
            onUploadSuccess(
              'https://storage.example.com/payment-proofs/' + file.name, 
              file.name
            );
          }
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Upload Payment Proof
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please upload a screenshot or PDF of your payment confirmation
        </p>
      </motion.div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </motion.div>
      )}
      
      {!file && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`relative p-[1px] rounded-xl overflow-hidden ${
            isDragging 
              ? 'bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500' 
              : 'bg-gradient-to-r from-teal-500/40 via-indigo-500/40 to-purple-500/40'
          }`}
        >
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center h-64 ${
              isDragging 
                ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
            } transition-colors duration-300`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Upload className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            
            <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
              Drag & Drop your file here
            </p>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              or
            </p>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-6 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: JPEG, PNG, PDF (max 5MB)
            </p>
          </div>
        </motion.div>
      )}
      
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center">
              {previewUrl ? (
                <Image className="h-5 w-5 text-indigo-500 mr-2" />
              ) : (
                <FileText className="h-5 w-5 text-indigo-500 mr-2" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
            </div>
            
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            {previewUrl && (
              <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-48" />
              </div>
            )}
            
            {!previewUrl && file.type.match('application/pdf') && (
              <div className="mb-4 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 text-indigo-500 mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              </div>
            )}
            
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Uploading...</span>
                  <span className="text-gray-700 dark:text-gray-300">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {success ? (
              <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                <Check className="h-5 w-5 mr-2" />
                <span>Upload successful!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={simulateUpload}
                disabled={isUploading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
              >
                {isUploading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          For bank transfers, please include your order reference in the payment details. 
          Your server will be set up after payment verification.
        </p>
      </div>
    </div>
  );
};

export default PaymentProofUpload; 