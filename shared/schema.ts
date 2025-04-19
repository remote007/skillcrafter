import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  theme: text("theme").default("minimal"),
  socialLinks: jsonb("social_links").default({}),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  bio: true,
  profileImage: true,
  theme: true,
  socialLinks: true,
});

// CaseStudy Schema
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  overview: text("overview"),
  coverImage: text("cover_image"),
  slug: text("slug").notNull(),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  tools: jsonb("tools").default([]),
  tags: jsonb("tags").default([]),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).pick({
  userId: true,
  title: true,
  summary: true,
  overview: true,
  coverImage: true,
  slug: true,
  status: true,
  tools: true,
  tags: true,
});

// Media Schema
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caseStudyId: integer("case_study_id"),
  url: text("url").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).pick({
  userId: true,
  caseStudyId: true,
  url: true,
  type: true,
  name: true,
});

// Timeline Schema
export const timelineItems = pgTable("timeline_items", {
  id: serial("id").primaryKey(),
  caseStudyId: integer("case_study_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  order: integer("order").notNull(),
});

export const insertTimelineItemSchema = createInsertSchema(timelineItems).pick({
  caseStudyId: true,
  title: true,
  description: true,
  date: true,
  order: true,
});

// Analytics Schema
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caseStudyId: integer("case_study_id"),
  visitDate: timestamp("visit_date").defaultNow(),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  caseStudyId: true,
  ipAddress: true,
  referrer: true,
});

// Testimonials Schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  caseStudyId: integer("case_study_id").notNull(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  position: text("position"),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  caseStudyId: true,
  text: true,
  author: true,
  position: true,
});

// Metrics Schema
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  caseStudyId: integer("case_study_id").notNull(),
  title: text("title").notNull(),
  value: text("value").notNull(),
  subtitle: text("subtitle"),
  icon: text("icon"),
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  caseStudyId: true,
  title: true,
  value: true,
  subtitle: true,
  icon: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type TimelineItem = typeof timelineItems.$inferSelect;
export type InsertTimelineItem = z.infer<typeof insertTimelineItemSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
