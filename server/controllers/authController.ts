import { Express, Request, Response } from "express";
import passport from "passport";
import { storage } from "../storage";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { hashPassword, generateToken, isAuthenticated } from "../middleware/auth";
import { z } from "zod";

// Additional validation schema for registration
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
});

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const userData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create new user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      // Generate JWT token
      const token = generateToken(newUser);
      
      // Log the user in automatically
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        
        return res.status(201).json({
          user: userWithoutPassword,
          token
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        // Generate JWT token
        const token = generateToken(user);
        
        return res.status(200).json({
          user: userWithoutPassword,
          token
        });
      });
    })(req, res, next);
  });
  
  // Logout user
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user
  app.get("/api/auth/user", isAuthenticated, (req: Request, res: Response) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as Express.User;
    
    res.status(200).json({ user: userWithoutPassword });
  });
  
  // Update user profile
  app.put("/api/auth/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      
      // Validate request body - allow partial updates
      const updateSchema = insertUserSchema.partial().omit({ password: true });
      const updateData = updateSchema.parse(req.body);
      
      // Check for username uniqueness if being updated
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
      
      // Check for email uniqueness if being updated
      if (updateData.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email is already registered" });
        }
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Profile update error:", error);
      return res.status(500).json({ message: "Server error updating profile" });
    }
  });
  
  // Change password
  app.put("/api/auth/change-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }
      
      const userId = (req.user as Express.User).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await hashPassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      return res.status(500).json({ message: "Server error changing password" });
    }
  });
}
