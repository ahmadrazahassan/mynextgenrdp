'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Download, Eye, FileImage } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import Image from 'next/image';

interface MediaItem {
  id: string;
  path: string;
  fileName: string;
  fileType: string;
  uploadDate: Date;
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
  fileSize: number;
  thumbnailPath: string;
  tags: string[];
}

export default function RecentMediaDisplay({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const [recentUploads, setRecentUploads] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Function to refresh recent uploads
  const loadRecentUploads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/media?limit=5', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentUploads(data);
      } else {
        toast({
          title: "Failed to load media",
          description: "Could not retrieve your recent uploads.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading recent uploads:', error);
      toast({
        title: "Connection error",
        description: "Could not connect to the server to retrieve uploads.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle view image in modal
  const handleViewImage = (item: MediaItem) => {
    setSelectedImage(item);
    setViewDialogOpen(true);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  // Handle direct download
  const handleDownload = (item: MediaItem) => {
    // Create temporary link element
    const link = document.createElement('a');
    link.href = item.path;
    link.download = item.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `Downloading ${item.fileName}`,
    });
  };

  return (
    <>
      <Card className="shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle>Recent Media</CardTitle>
          <CardDescription>
            View recent uploaded media files
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Recent uploads section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Recent Uploads</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadRecentUploads}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {recentUploads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-5 w-5 animate-spin mb-2" />
                    <p>Loading recent uploads...</p>
                  </div>
                ) : (
                  <p>No uploads found. Click refresh to load media.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recentUploads.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden bg-white group hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gray-100">
                      {item.fileType.startsWith('image/') ? (
                        <img 
                          src={item.path} 
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileImage className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleViewImage(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate font-medium">{item.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.uploadDate).toLocaleString()}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500">{formatFileSize(item.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Image Preview Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="p-2 flex justify-center items-center overflow-hidden max-h-[70vh]">
            {selectedImage && selectedImage.fileType.startsWith('image/') ? (
              <img 
                src={selectedImage.path} 
                alt={selectedImage?.fileName || ''}
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded">
                <FileImage className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Uploaded: {selectedImage && new Date(selectedImage.uploadDate).toLocaleString()}
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => selectedImage && handleDownload(selectedImage)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 