import { useState } from "react";
import { Media } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaGalleryProps {
  mediaItems: Media[];
  title?: string;
}

export default function MediaGallery({ mediaItems, title }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  
  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-100 rounded-lg">
        <p className="text-slate-500">No media available</p>
      </div>
    );
  }
  
  // Get the main/featured media (first item)
  const mainMedia = mediaItems[0];
  
  // Get the rest of the media for the gallery
  const galleryMedia = mediaItems.slice(1);
  
  // Handle media click to open modal
  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
  };
  
  // Close modal
  const handleClose = () => {
    setSelectedMedia(null);
  };
  
  return (
    <div className="mb-12">
      {title && <h2 className="text-2xl font-bold mb-6 text-slate-800">{title}</h2>}
      
      {/* Main media display */}
      <div className="rounded-lg overflow-hidden mb-4 cursor-pointer" onClick={() => handleMediaClick(mainMedia)}>
        {mainMedia.type === 'image' ? (
          <img 
            src={mainMedia.url} 
            alt={mainMedia.name} 
            className="w-full h-auto"
          />
        ) : (
          <video 
            src={mainMedia.url} 
            controls 
            className="w-full h-auto"
          />
        )}
      </div>
      
      {/* Gallery grid */}
      {galleryMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {galleryMedia.map((media) => (
            <div 
              key={media.id} 
              className="rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleMediaClick(media)}
            >
              {media.type === 'image' ? (
                <img 
                  src={media.url} 
                  alt={media.name} 
                  className="w-full h-auto aspect-video object-cover"
                />
              ) : (
                <video 
                  src={media.url}
                  className="w-full h-auto aspect-video object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for viewing media */}
      <Dialog open={!!selectedMedia} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
            <DialogDescription>
              {new Date(selectedMedia?.createdAt || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedMedia?.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.name} 
                className="w-full h-auto"
              />
            ) : (
              <video 
                src={selectedMedia?.url} 
                controls 
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
