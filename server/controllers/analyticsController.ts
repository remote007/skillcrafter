import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";
import { insertAnalyticsSchema, User } from "@shared/schema";
import { z } from "zod";

export function registerAnalyticsRoutes(app: Express) {
  // Record a page visit
  app.post("/api/analytics/hit/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      // Special handling to avoid conflicts with auth routes
      if (username === 'auth') {
        return res.status(404).json({ message: "Invalid path" });
      }
      
      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create analytics entry
      const analyticsData = insertAnalyticsSchema.parse({
        userId: user.id,
        caseStudyId: req.body.caseStudyId ? parseInt(req.body.caseStudyId, 10) : undefined,
        ipAddress: req.ip,
        referrer: req.get('Referer') || ''
      });
      
      await storage.createAnalyticsEntry(analyticsData);
      
      res.status(201).json({ message: "Visit recorded" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Error recording visit:", error);
      res.status(500).json({ message: "Server error recording visit" });
    }
  });
  
  // Get analytics for a user
  app.get("/api/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      
      // Get all user's analytics entries
      const analyticsEntries = await storage.getAnalyticsByUserId(userId);
      
      // Get all user's case studies to include in the response
      const caseStudies = await storage.getCaseStudiesByUserId(userId);
      
      // Process analytics data
      const processedData = processAnalyticsData(analyticsEntries, caseStudies);
      
      res.status(200).json(processedData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Server error fetching analytics" });
    }
  });
  
  // Get analytics for a specific case study
  app.get("/api/analytics/case-study/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const caseStudyId = parseInt(req.params.id, 10);
      
      // Check if case study exists and belongs to the user
      const caseStudy = await storage.getCaseStudy(caseStudyId);
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }
      
      if (caseStudy.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to view analytics for this case study" });
      }
      
      // Get analytics entries for the case study
      const analyticsEntries = await storage.getAnalyticsByCaseStudyId(caseStudyId);
      
      // Process case study analytics data
      const processedData = processCaseStudyAnalytics(analyticsEntries, caseStudy);
      
      res.status(200).json(processedData);
    } catch (error) {
      console.error("Error fetching case study analytics:", error);
      res.status(500).json({ message: "Server error fetching case study analytics" });
    }
  });
  
  // Helper functions to process analytics data
  function processAnalyticsData(entries: any[], caseStudies: any[]) {
    // Group entries by date
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    
    // Filter entries to last 30 days
    const recentEntries = entries.filter(entry => new Date(entry.visitDate) >= last30Days);
    
    // Group by date
    const visitsByDate = recentEntries.reduce((acc: any, entry: any) => {
      const date = new Date(entry.visitDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});
    
    // Group by case study
    const visitsByCaseStudy = recentEntries.reduce((acc: any, entry: any) => {
      if (entry.caseStudyId) {
        if (!acc[entry.caseStudyId]) {
          acc[entry.caseStudyId] = 0;
        }
        acc[entry.caseStudyId]++;
      }
      return acc;
    }, {});
    
    // Group by referrer
    const visitsByReferrer = recentEntries.reduce((acc: any, entry: any) => {
      if (entry.referrer) {
        const referrer = extractDomain(entry.referrer);
        if (!acc[referrer]) {
          acc[referrer] = 0;
        }
        acc[referrer]++;
      }
      return acc;
    }, {});
    
    // Map case study IDs to titles
    const caseStudyNames = caseStudies.reduce((acc: any, cs: any) => {
      acc[cs.id] = cs.title;
      return acc;
    }, {});
    
    // Format for chart display
    const visitsChartData = Object.entries(visitsByDate).map(([date, count]) => ({
      date,
      visits: count
    }));
    
    const caseStudyChartData = Object.entries(visitsByCaseStudy).map(([id, count]) => ({
      id: parseInt(id, 10),
      title: caseStudyNames[id] || `Case Study ${id}`,
      visits: count
    }));
    
    const referrerChartData = Object.entries(visitsByReferrer).map(([referrer, count]) => ({
      referrer,
      visits: count
    }));
    
    return {
      totalVisits: entries.length,
      recentVisits: recentEntries.length,
      visitsChartData: visitsChartData.sort((a: any, b: any) => a.date.localeCompare(b.date)),
      caseStudyChartData: caseStudyChartData.sort((a: any, b: any) => b.visits - a.visits),
      referrerChartData: referrerChartData.sort((a: any, b: any) => b.visits - a.visits)
    };
  }
  
  function processCaseStudyAnalytics(entries: any[], caseStudy: any) {
    // Group entries by date
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    
    // Filter entries to last 30 days
    const recentEntries = entries.filter(entry => new Date(entry.visitDate) >= last30Days);
    
    // Group by date
    const visitsByDate = recentEntries.reduce((acc: any, entry: any) => {
      const date = new Date(entry.visitDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});
    
    // Group by referrer
    const visitsByReferrer = recentEntries.reduce((acc: any, entry: any) => {
      if (entry.referrer) {
        const referrer = extractDomain(entry.referrer);
        if (!acc[referrer]) {
          acc[referrer] = 0;
        }
        acc[referrer]++;
      }
      return acc;
    }, {});
    
    // Format for chart display
    const visitsChartData = Object.entries(visitsByDate).map(([date, count]) => ({
      date,
      visits: count
    }));
    
    const referrerChartData = Object.entries(visitsByReferrer).map(([referrer, count]) => ({
      referrer,
      visits: count
    }));
    
    return {
      caseStudy,
      totalVisits: entries.length,
      recentVisits: recentEntries.length,
      visitsChartData: visitsChartData.sort((a: any, b: any) => a.date.localeCompare(b.date)),
      referrerChartData: referrerChartData.sort((a: any, b: any) => b.visits - a.visits)
    };
  }
  
  function extractDomain(url: string) {
    try {
      if (!url.startsWith('http')) {
        url = 'http://' + url;
      }
      const domain = new URL(url).hostname;
      return domain;
    } catch (e) {
      return url;
    }
  }
}
