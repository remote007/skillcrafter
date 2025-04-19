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

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

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

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Case Study Methods
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudies.get(id);
  }
  
  async getCaseStudyBySlug(slug: string, username: string): Promise<CaseStudy | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    return Array.from(this.caseStudies.values()).find(
      cs => cs.slug === slug && cs.userId === user.id
    );
  }

  async getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values()).filter(
      caseStudy => caseStudy.userId === userId
    );
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.caseStudyId++;
    const now = new Date();
    const caseStudy: CaseStudy = { 
      ...insertCaseStudy, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.caseStudies.set(id, caseStudy);
    return caseStudy;
  }
  
  async updateCaseStudy(id: number, caseStudyData: Partial<InsertCaseStudy>): Promise<CaseStudy | undefined> {
    const caseStudy = await this.getCaseStudy(id);
    if (!caseStudy) return undefined;
    
    const now = new Date();
    const updatedCaseStudy = { ...caseStudy, ...caseStudyData, updatedAt: now };
    this.caseStudies.set(id, updatedCaseStudy);
    return updatedCaseStudy;
  }
  
  async deleteCaseStudy(id: number): Promise<boolean> {
    return this.caseStudies.delete(id);
  }

  // Media Methods
  async getMedia(id: number): Promise<Media | undefined> {
    return this.mediaItems.get(id);
  }
  
  async getMediaByCaseStudyId(caseStudyId: number): Promise<Media[]> {
    return Array.from(this.mediaItems.values()).filter(
      media => media.caseStudyId === caseStudyId
    );
  }
  
  async getMediaByUserId(userId: number): Promise<Media[]> {
    return Array.from(this.mediaItems.values()).filter(
      media => media.userId === userId
    );
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaId++;
    const now = new Date();
    const media: Media = { 
      ...insertMedia, 
      id,
      createdAt: now
    };
    this.mediaItems.set(id, media);
    return media;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    return this.mediaItems.delete(id);
  }

  // Timeline Methods
  async getTimelineItemsByCaseStudyId(caseStudyId: number): Promise<TimelineItem[]> {
    return Array.from(this.timelineItems.values())
      .filter(item => item.caseStudyId === caseStudyId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createTimelineItem(insertTimelineItem: InsertTimelineItem): Promise<TimelineItem> {
    const id = this.timelineItemId++;
    const timelineItem: TimelineItem = { 
      ...insertTimelineItem, 
      id
    };
    this.timelineItems.set(id, timelineItem);
    return timelineItem;
  }
  
  async updateTimelineItem(id: number, itemData: Partial<InsertTimelineItem>): Promise<TimelineItem | undefined> {
    const timelineItem = this.timelineItems.get(id);
    if (!timelineItem) return undefined;
    
    const updatedItem = { ...timelineItem, ...itemData };
    this.timelineItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteTimelineItem(id: number): Promise<boolean> {
    return this.timelineItems.delete(id);
  }

  // Analytics Methods
  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    return Array.from(this.analyticsEntries.values()).filter(
      entry => entry.userId === userId
    );
  }
  
  async getAnalyticsByCaseStudyId(caseStudyId: number): Promise<Analytics[]> {
    return Array.from(this.analyticsEntries.values()).filter(
      entry => entry.caseStudyId === caseStudyId
    );
  }
  
  async createAnalyticsEntry(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsId++;
    const now = new Date();
    const analyticsEntry: Analytics = { 
      ...insertAnalytics, 
      id,
      visitDate: now
    };
    this.analyticsEntries.set(id, analyticsEntry);
    return analyticsEntry;
  }

  // Testimonial Methods
  async getTestimonialsByCaseStudyId(caseStudyId: number): Promise<Testimonial[]> {
    return Array.from(this.testimonialItems.values()).filter(
      testimonial => testimonial.caseStudyId === caseStudyId
    );
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const testimonial: Testimonial = { 
      ...insertTestimonial, 
      id
    };
    this.testimonialItems.set(id, testimonial);
    return testimonial;
  }
  
  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonialItems.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, ...testimonialData };
    this.testimonialItems.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonialItems.delete(id);
  }

  // Metrics Methods
  async getMetricsByCaseStudyId(caseStudyId: number): Promise<Metric[]> {
    return Array.from(this.metricItems.values()).filter(
      metric => metric.caseStudyId === caseStudyId
    );
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.metricId++;
    const metric: Metric = { 
      ...insertMetric, 
      id
    };
    this.metricItems.set(id, metric);
    return metric;
  }
  
  async updateMetric(id: number, metricData: Partial<InsertMetric>): Promise<Metric | undefined> {
    const metric = this.metricItems.get(id);
    if (!metric) return undefined;
    
    const updatedMetric = { ...metric, ...metricData };
    this.metricItems.set(id, updatedMetric);
    return updatedMetric;
  }
  
  async deleteMetric(id: number): Promise<boolean> {
    return this.metricItems.delete(id);
  }
}

export const storage = new MemStorage();
