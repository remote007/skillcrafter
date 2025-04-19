import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";
import { 
  insertCaseStudySchema, 
  insertTimelineItemSchema,
  insertTestimonialSchema,
  insertMetricSchema
} from "@shared/schema";
import { z } from "zod";

export function registerPortfolioRoutes(app: Express) {
  // Get all case studies for a user (either by id or username)
  app.get("/api/portfolio/:identifier", async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;
      
      // Special handling to avoid conflicts with auth routes
      if (identifier === 'auth') {
        return res.status(404).json({ message: "Invalid path" });
      }
      
      let userId: number;
      
      // Check if identifier is numeric (user ID) or a string (username)
      if (/^\d+$/.test(identifier)) {
        userId = parseInt(identifier, 10);
      } else {
        // Get user by username
        const user = await storage.getUserByUsername(identifier);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        userId = user.id;
      }
      
      // Get case studies for the user
      const caseStudies = await storage.getCaseStudiesByUserId(userId);
      
      // Get the user data to include with portfolio
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        user: userWithoutPassword,
        caseStudies
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Server error fetching portfolio" });
    }
  });
  
  // Get case studies for authenticated user
  app.get("/api/portfolio", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudies = await storage.getCaseStudiesByUserId(userId);
      
      res.status(200).json({ caseStudies });
    } catch (error) {
      console.error("Error fetching case studies:", error);
      res.status(500).json({ message: "Server error fetching case studies" });
    }
  });
  
  // Get a single case study by ID
  app.get("/api/portfolio/case-study/:id", async (req: Request, res: Response) => {
    try {
      const caseStudyId = parseInt(req.params.id, 10);
      const caseStudy = await storage.getCaseStudy(caseStudyId);
      
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      // Get related data for the case study
      const timelineItems = await storage.getTimelineItemsByCaseStudyId(caseStudyId);
      const mediaItems = await storage.getMediaByCaseStudyId(caseStudyId);
      const testimonials = await storage.getTestimonialsByCaseStudyId(caseStudyId);
      const metrics = await storage.getMetricsByCaseStudyId(caseStudyId);
      
      // Get user data
      const user = await storage.getUser(caseStudy.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        caseStudy,
        timelineItems,
        mediaItems,
        testimonials,
        metrics,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error fetching case study:", error);
      res.status(500).json({ message: "Server error fetching case study" });
    }
  });
  
  // Get a single case study by slug and username
  app.get("/api/portfolio/:username/:slug", async (req: Request, res: Response) => {
    try {
      const { username, slug } = req.params;
      
      // Special handling to avoid conflicts with auth routes
      if (username === 'auth') {
        return res.status(404).json({ message: "Invalid path" });
      }
      
      const caseStudy = await storage.getCaseStudyBySlug(slug, username);
      
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      // Get related data for the case study
      const timelineItems = await storage.getTimelineItemsByCaseStudyId(caseStudy.id);
      const mediaItems = await storage.getMediaByCaseStudyId(caseStudy.id);
      const testimonials = await storage.getTestimonialsByCaseStudyId(caseStudy.id);
      const metrics = await storage.getMetricsByCaseStudyId(caseStudy.id);
      
      // Get user data
      const user = await storage.getUser(caseStudy.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      // Register a page view in analytics
      await storage.createAnalyticsEntry({
        userId: caseStudy.userId,
        caseStudyId: caseStudy.id,
        ipAddress: req.ip,
        referrer: req.get('Referer') || ''
      });
      
      res.status(200).json({
        caseStudy,
        timelineItems,
        mediaItems,
        testimonials,
        metrics,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error fetching case study by slug:", error);
      res.status(500).json({ message: "Server error fetching case study" });
    }
  });
  
  // Create a new case study
  app.post("/api/portfolio", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      
      // Validate request body
      const caseStudyData = insertCaseStudySchema.parse({
        ...req.body,
        userId  // Ensure the userId is set to the authenticated user
      });
      
      // Generate a slug if not provided
      if (!caseStudyData.slug) {
        caseStudyData.slug = caseStudyData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Create the case study
      const newCaseStudy = await storage.createCaseStudy(caseStudyData);
      
      res.status(201).json({ caseStudy: newCaseStudy });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error creating case study:", error);
      res.status(500).json({ message: "Server error creating case study" });
    }
  });
  
  // Update a case study
  app.put("/api/portfolio/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.id, 10);
      
      // Check if case study exists and belongs to the user
      const existingCaseStudy = await storage.getCaseStudy(caseStudyId);
      if (!existingCaseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (existingCaseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this case study" });
      }
      
      // Validate request body
      const updateSchema = insertCaseStudySchema.partial();
      const updateData = updateSchema.parse(req.body);
      
      // Update the case study
      const updatedCaseStudy = await storage.updateCaseStudy(caseStudyId, updateData);
      
      res.status(200).json({ caseStudy: updatedCaseStudy });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error updating case study:", error);
      res.status(500).json({ message: "Server error updating case study" });
    }
  });
  
  // Delete a case study
  app.delete("/api/portfolio/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.id, 10);
      
      // Check if case study exists and belongs to the user
      const existingCaseStudy = await storage.getCaseStudy(caseStudyId);
      if (!existingCaseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (existingCaseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this case study" });
      }
      
      // Delete the case study
      await storage.deleteCaseStudy(caseStudyId);
      
      res.status(200).json({ message: "Case study deleted successfully" });
    } catch (error) {
      console.error("Error deleting case study:", error);
      res.status(500).json({ message: "Server error deleting case study" });
    }
  });
  
  // Timeline Items CRUD
  
  // Add a timeline item
  app.post("/api/portfolio/:caseStudyId/timeline", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.caseStudyId, 10);
      
      // Check if case study exists and belongs to the user
      const existingCaseStudy = await storage.getCaseStudy(caseStudyId);
      if (!existingCaseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (existingCaseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to add a timeline item to this case study" });
      }
      
      // Validate request body
      const timelineData = insertTimelineItemSchema.parse({
        ...req.body,
        caseStudyId
      });
      
      // Create the timeline item
      const newTimelineItem = await storage.createTimelineItem(timelineData);
      
      res.status(201).json({ timelineItem: newTimelineItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error creating timeline item:", error);
      res.status(500).json({ message: "Server error creating timeline item" });
    }
  });
  
  // Update a timeline item
  app.put("/api/portfolio/timeline/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const timelineItemId = parseInt(req.params.id, 10);
      
      // Check if timeline item exists
      const existingTimelineItem = await storage.getTimelineItemsByCaseStudyId(req.body.caseStudyId)
        .then(items => items.find(item => item.id === timelineItemId));
      
      if (!existingTimelineItem) {
        return res.status(404).json({ message: "Timeline item not found" });
      }
      
      // Check if the case study belongs to the user
      const caseStudy = await storage.getCaseStudy(existingTimelineItem.caseStudyId);
      if (!caseStudy || caseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this timeline item" });
      }
      
      // Validate request body
      const updateSchema = insertTimelineItemSchema.partial();
      const updateData = updateSchema.parse(req.body);
      
      // Update the timeline item
      const updatedTimelineItem = await storage.updateTimelineItem(timelineItemId, updateData);
      
      res.status(200).json({ timelineItem: updatedTimelineItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error updating timeline item:", error);
      res.status(500).json({ message: "Server error updating timeline item" });
    }
  });
  
  // Delete a timeline item
  app.delete("/api/portfolio/timeline/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const timelineItemId = parseInt(req.params.id, 10);
      
      // Check if timeline item exists
      const caseStudyId = parseInt(req.query.caseStudyId as string, 10);
      const existingTimelineItem = await storage.getTimelineItemsByCaseStudyId(caseStudyId)
        .then(items => items.find(item => item.id === timelineItemId));
      
      if (!existingTimelineItem) {
        return res.status(404).json({ message: "Timeline item not found" });
      }
      
      // Check if the case study belongs to the user
      const caseStudy = await storage.getCaseStudy(caseStudyId);
      if (!caseStudy || caseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this timeline item" });
      }
      
      // Delete the timeline item
      await storage.deleteTimelineItem(timelineItemId);
      
      res.status(200).json({ message: "Timeline item deleted successfully" });
    } catch (error) {
      console.error("Error deleting timeline item:", error);
      res.status(500).json({ message: "Server error deleting timeline item" });
    }
  });
  
  // Testimonial CRUD
  
  // Add a testimonial
  app.post("/api/portfolio/:caseStudyId/testimonial", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.caseStudyId, 10);
      
      // Check if case study exists and belongs to the user
      const existingCaseStudy = await storage.getCaseStudy(caseStudyId);
      if (!existingCaseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (existingCaseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to add a testimonial to this case study" });
      }
      
      // Validate request body
      const testimonialData = insertTestimonialSchema.parse({
        ...req.body,
        caseStudyId
      });
      
      // Create the testimonial
      const newTestimonial = await storage.createTestimonial(testimonialData);
      
      res.status(201).json({ testimonial: newTestimonial });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Server error creating testimonial" });
    }
  });
  
  // Metrics CRUD
  
  // Add a metric
  app.post("/api/portfolio/:caseStudyId/metric", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.caseStudyId, 10);
      
      // Check if case study exists and belongs to the user
      const existingCaseStudy = await storage.getCaseStudy(caseStudyId);
      if (!existingCaseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (existingCaseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to add a metric to this case study" });
      }
      
      // Validate request body
      const metricData = insertMetricSchema.parse({
        ...req.body,
        caseStudyId
      });
      
      // Create the metric
      const newMetric = await storage.createMetric(metricData);
      
      res.status(201).json({ metric: newMetric });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error creating metric:", error);
      res.status(500).json({ message: "Server error creating metric" });
    }
  });
}
