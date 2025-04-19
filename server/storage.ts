import { users, caseStudies, media, timelineItems, analytics, testimonials, metrics } from "@shared/schema";
import type {
  User,
  InsertUser,
  CaseStudy,
  InsertCaseStudy,
  Media,
  InsertMedia,
  TimelineItem,
  InsertTimelineItem,
  Analytics,
  InsertAnalytics,
  Testimonial,
  InsertTestimonial,
  Metric,
  InsertMetric
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Case Study operations
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  getCaseStudyBySlug(slug: string, username: string): Promise<CaseStudy | undefined>;
  getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, caseStudy: Partial<InsertCaseStudy>): Promise<CaseStudy | undefined>;
  deleteCaseStudy(id: number): Promise<boolean>;
  
  // Media operations
  getMedia(id: number): Promise<Media | undefined>;
  getMediaByCaseStudyId(caseStudyId: number): Promise<Media[]>;
  getMediaByUserId(userId: number): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Timeline operations
  getTimelineItemsByCaseStudyId(caseStudyId: number): Promise<TimelineItem[]>;
  createTimelineItem(timelineItem: InsertTimelineItem): Promise<TimelineItem>;
  updateTimelineItem(id: number, timelineItem: Partial<InsertTimelineItem>): Promise<TimelineItem | undefined>;
  deleteTimelineItem(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalyticsByUserId(userId: number): Promise<Analytics[]>;
  getAnalyticsByCaseStudyId(caseStudyId: number): Promise<Analytics[]>;
  createAnalyticsEntry(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Testimonial operations
  getTestimonialsByCaseStudyId(caseStudyId: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Metrics operations
  getMetricsByCaseStudyId(caseStudyId: number): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;
  deleteMetric(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Change the type to avoid the error
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid type error

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Case Study Methods
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    const [caseStudy] = await db.select().from(caseStudies).where(eq(caseStudies.id, id));
    return caseStudy;
  }
  
  async getCaseStudyBySlug(slug: string, username: string): Promise<CaseStudy | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const [caseStudy] = await db.select()
      .from(caseStudies)
      .where(
        and(
          eq(caseStudies.slug, slug),
          eq(caseStudies.userId, user.id)
        )
      );
    return caseStudy;
  }

  async getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]> {
    return db.select()
      .from(caseStudies)
      .where(eq(caseStudies.userId, userId));
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const [caseStudy] = await db
      .insert(caseStudies)
      .values(insertCaseStudy)
      .returning();
    return caseStudy;
  }
  
  async updateCaseStudy(id: number, caseStudyData: Partial<InsertCaseStudy>): Promise<CaseStudy | undefined> {
    const now = new Date();
    const [updatedCaseStudy] = await db
      .update(caseStudies)
      .set({ ...caseStudyData, updatedAt: now })
      .where(eq(caseStudies.id, id))
      .returning();
    return updatedCaseStudy;
  }
  
  async deleteCaseStudy(id: number): Promise<boolean> {
    await db.delete(caseStudies).where(eq(caseStudies.id, id));
    return true; // In a real app, we would check rows affected
  }

  // Media Methods
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }
  
  async getMediaByCaseStudyId(caseStudyId: number): Promise<Media[]> {
    return db.select()
      .from(media)
      .where(eq(media.caseStudyId, caseStudyId));
  }
  
  async getMediaByUserId(userId: number): Promise<Media[]> {
    return db.select()
      .from(media)
      .where(eq(media.userId, userId));
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db
      .insert(media)
      .values(insertMedia)
      .returning();
    return mediaItem;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    await db.delete(media).where(eq(media.id, id));
    return true;
  }

  // Timeline Methods
  async getTimelineItemsByCaseStudyId(caseStudyId: number): Promise<TimelineItem[]> {
    return db.select()
      .from(timelineItems)
      .where(eq(timelineItems.caseStudyId, caseStudyId))
      .orderBy(timelineItems.order);
  }
  
  async createTimelineItem(insertTimelineItem: InsertTimelineItem): Promise<TimelineItem> {
    const [timelineItem] = await db
      .insert(timelineItems)
      .values(insertTimelineItem)
      .returning();
    return timelineItem;
  }
  
  async updateTimelineItem(id: number, itemData: Partial<InsertTimelineItem>): Promise<TimelineItem | undefined> {
    const [updatedItem] = await db
      .update(timelineItems)
      .set(itemData)
      .where(eq(timelineItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteTimelineItem(id: number): Promise<boolean> {
    await db.delete(timelineItems).where(eq(timelineItems.id, id));
    return true;
  }

  // Analytics Methods
  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    return db.select()
      .from(analytics)
      .where(eq(analytics.userId, userId));
  }
  
  async getAnalyticsByCaseStudyId(caseStudyId: number): Promise<Analytics[]> {
    return db.select()
      .from(analytics)
      .where(eq(analytics.caseStudyId, caseStudyId));
  }
  
  async createAnalyticsEntry(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsEntry] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsEntry;
  }

  // Testimonial Methods
  async getTestimonialsByCaseStudyId(caseStudyId: number): Promise<Testimonial[]> {
    return db.select()
      .from(testimonials)
      .where(eq(testimonials.caseStudyId, caseStudyId));
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }
  
  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set(testimonialData)
      .where(eq(testimonials.id, id))
      .returning();
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return true;
  }

  // Metrics Methods
  async getMetricsByCaseStudyId(caseStudyId: number): Promise<Metric[]> {
    return db.select()
      .from(metrics)
      .where(eq(metrics.caseStudyId, caseStudyId));
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db
      .insert(metrics)
      .values(insertMetric)
      .returning();
    return metric;
  }
  
  async updateMetric(id: number, metricData: Partial<InsertMetric>): Promise<Metric | undefined> {
    const [updatedMetric] = await db
      .update(metrics)
      .set(metricData)
      .where(eq(metrics.id, id))
      .returning();
    return updatedMetric;
  }
  
  async deleteMetric(id: number): Promise<boolean> {
    await db.delete(metrics).where(eq(metrics.id, id));
    return true;
  }
}

// Keep the MemStorage for reference (commented out)
/*
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private caseStudies: Map<number, CaseStudy>;
  private mediaItems: Map<number, Media>;
  private timelineItems: Map<number, TimelineItem>;
  private analyticsEntries: Map<number, Analytics>;
  private testimonialItems: Map<number, Testimonial>;
  private metricItems: Map<number, Metric>;
  
  // IDs for autoincrement
  private userId: number;
  private caseStudyId: number;
  private mediaId: number;
  private timelineItemId: number;
  private analyticsId: number;
  private testimonialId: number;
  private metricId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.caseStudies = new Map();
    this.mediaItems = new Map();
    this.timelineItems = new Map();
    this.analyticsEntries = new Map();
    this.testimonialItems = new Map();
    this.metricItems = new Map();
    
    this.userId = 1;
    this.caseStudyId = 1;
    this.mediaId = 1;
    this.timelineItemId = 1;
    this.analyticsId = 1;
    this.testimonialId = 1;
    this.metricId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
  }

  // All methods from MemStorage...
}
*/

export const storage = new DatabaseStorage();
