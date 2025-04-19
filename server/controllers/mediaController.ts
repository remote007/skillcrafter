import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";
import { uploadSingle, uploadMultiple } from "../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { insertMediaSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";

export function registerMediaRoutes(app: Express) {
  // Upload a single file
  app.post("/api/media/upload", isAuthenticated, uploadSingle, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path);
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);
      
      if (!result || !result.secure_url) {
        return res.status(500).json({ message: "Failed to upload to Cloudinary" });
      }
      
      // Create media record
      const mediaData = insertMediaSchema.parse({
        userId,
        caseStudyId: req.body.caseStudyId ? parseInt(req.body.caseStudyId, 10) : undefined,
        url: result.secure_url,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
        name: req.file.originalname
      });
      
      const media = await storage.createMedia(mediaData);
      
      res.status(201).json({ 
        media,
        cloudinaryData: result 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Server error uploading media" });
    }
  });
  
  // Upload multiple files
  app.post("/api/media/upload-multiple", isAuthenticated, uploadMultiple, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const uploadedMedia = [];
      const files = req.files as Express.Multer.File[];
      
      // Upload each file to Cloudinary
      for (const file of files) {
        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(file.path);
          
          // Clean up the temporary file
          fs.unlinkSync(file.path);
          
          if (!result || !result.secure_url) {
            continue; // Skip if upload failed
          }
          
          // Create media record
          const mediaData = insertMediaSchema.parse({
            userId,
            caseStudyId: req.body.caseStudyId ? parseInt(req.body.caseStudyId, 10) : undefined,
            url: result.secure_url,
            type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            name: file.originalname
          });
          
          const media = await storage.createMedia(mediaData);
          
          uploadedMedia.push({
            media,
            cloudinaryData: result
          });
        } catch (uploadError) {
          console.error(`Error uploading file ${file.originalname}:`, uploadError);
          // Continue with other files even if one fails
        }
      }
      
      if (uploadedMedia.length === 0) {
        return res.status(500).json({ message: "Failed to upload any files" });
      }
      
      res.status(201).json({ 
        uploadedCount: uploadedMedia.length,
        totalFiles: files.length,
        media: uploadedMedia 
      });
    } catch (error) {
      console.error("Error uploading multiple media:", error);
      res.status(500).json({ message: "Server error uploading media" });
    }
  });
  
  // Get all media for the user
  app.get("/api/media", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const media = await storage.getMediaByUserId(userId);
      
      res.status(200).json({ media });
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Server error fetching media" });
    }
  });
  
  // Get media for a specific case study
  app.get("/api/media/case-study/:id", async (req: Request, res: Response) => {
    try {
      const caseStudyId = parseInt(req.params.id, 10);
      const media = await storage.getMediaByCaseStudyId(caseStudyId);
      
      res.status(200).json({ media });
    } catch (error) {
      console.error("Error fetching media for case study:", error);
      res.status(500).json({ message: "Server error fetching media" });
    }
  });
  
  // Delete media
  app.delete("/api/media/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const mediaId = parseInt(req.params.id, 10);
      
      // Check if media exists
      const media = await storage.getMedia(mediaId);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      // Check if media belongs to the user
      if (media.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this media" });
      }
      
      // Extract public ID from Cloudinary URL
      const urlParts = media.url.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const publicId = filenameWithExt.split('.')[0];
      
      // Delete from Cloudinary
      await deleteFromCloudinary(publicId);
      
      // Delete from storage
      await storage.deleteMedia(mediaId);
      
      res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Server error deleting media" });
    }
  });
}
