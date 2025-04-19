import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./middleware/auth";
import { storage } from "./storage";

// Controllers
import { registerAuthRoutes } from "./controllers/authController";
import { registerPortfolioRoutes } from "./controllers/portfolioController";
import { registerMediaRoutes } from "./controllers/mediaController";
import { registerAnalyticsRoutes } from "./controllers/analyticsController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  setupAuth(app);

  // Register all API routes
  registerAuthRoutes(app);
  registerPortfolioRoutes(app);
  registerMediaRoutes(app);
  registerAnalyticsRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
