import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, UploadCloud, Image, Film, Search, Trash } from "lucide-react";
import { cloudinaryUpload } from "@/services/cloudinary";

export default function MediaLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<any | null>(null);
  
  // Query media
  const { data, isLoading } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch media");
      }
      
      return res.json();
    },
    enabled: !!user,
  });
  
  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      return apiRequest("DELETE", `/api/media/${mediaId}`);
    },
    onSuccess: () => {
      toast({
        title: "Media deleted",
        description: "The media item has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setMediaToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete media: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Upload media mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        // First upload to Cloudinary
        const cloudinaryResult = await cloudinaryUpload(
          selectedFile!,
          (progress) => setUploadProgress(progress)
        );
        
        if (!cloudinaryResult || !cloudinaryResult.secure_url) {
          throw new Error("Failed to upload to Cloudinary");
        }
        
        // Then create media record in the backend
        const mediaData = {
          url: cloudinaryResult.secure_url,
          type: selectedFile!.type.startsWith('image/') ? 'image' : 'video',
          name: selectedFile!.name,
        };
        
        const res = await apiRequest("POST", "/api/media/upload", mediaData);
        return res.json();
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Only images and videos are allowed",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    uploadMutation.mutate(formData);
  };
  
  // Handle delete click
  const handleDeleteClick = (media: any) => {
    setMediaToDelete(media);
  };
  
  const confirmDelete = () => {
    if (mediaToDelete) {
      deleteMutation.mutate(mediaToDelete.id);
    }
  };
  
  // Filter media based on active tab and search term
  const filterMedia = () => {
    if (!data || !data.media) return [];
    
    return data.media.filter((media: any) => {
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "images" && media.type === "image") ||
        (activeTab === "videos" && media.type === "video");
      
      const matchesSearch = 
        !searchTerm || 
        media.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  };
  
  const filteredMedia = filterMedia();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Media Library" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                  Media Library
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage and organize your images and videos
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Media
                </Button>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all">All Media</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative rounded-md shadow-sm max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search media..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-slate-400">
                      {activeTab === "videos" ? (
                        <Film className="h-12 w-12" />
                      ) : (
                        <Image className="h-12 w-12" />
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No media found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by uploading some media"}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setUploadDialogOpen(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Media
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedia.map((media: any) => (
                      <Card key={media.id} className="group overflow-hidden">
                        <div className="relative">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="h-48 w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="h-48 w-full object-cover"
                              controls
                            />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteClick(media)}
                              className="h-8 w-8"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate" title={media.name}>
                            {media.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(media.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <UploadCloud className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              
              <Input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleFileChange} 
                disabled={uploading}
                className="mx-auto max-w-xs"
              />
              
              {selectedFile && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this media item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
