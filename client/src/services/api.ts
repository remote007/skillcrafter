import { queryClient } from "@/lib/queryClient";

// Base API URL
const BASE_URL = "/api";

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    USER: `${BASE_URL}/auth/user`,
    PROFILE: `${BASE_URL}/auth/profile`,
    PASSWORD: `${BASE_URL}/auth/change-password`,
  },
  PORTFOLIO: {
    BASE: `${BASE_URL}/portfolio`,
    GET_BY_USERNAME: (username: string) => `${BASE_URL}/portfolio/${username}`,
    CASE_STUDY: (id: number) => `${BASE_URL}/portfolio/${id}`,
    CASE_STUDY_BY_SLUG: (username: string, slug: string) => `${BASE_URL}/portfolio/${username}/${slug}`,
    TIMELINE: (caseStudyId: number) => `${BASE_URL}/portfolio/${caseStudyId}/timeline`,
    TIMELINE_ITEM: (id: number) => `${BASE_URL}/portfolio/timeline/${id}`,
    TESTIMONIAL: (caseStudyId: number) => `${BASE_URL}/portfolio/${caseStudyId}/testimonial`,
    METRIC: (caseStudyId: number) => `${BASE_URL}/portfolio/${caseStudyId}/metric`,
  },
  MEDIA: {
    BASE: `${BASE_URL}/media`,
    UPLOAD: `${BASE_URL}/media/upload`,
    UPLOAD_MULTIPLE: `${BASE_URL}/media/upload-multiple`,
    BY_CASE_STUDY: (caseStudyId: number) => `${BASE_URL}/media/case-study/${caseStudyId}`,
    DELETE: (id: number) => `${BASE_URL}/media/${id}`,
  },
  ANALYTICS: {
    BASE: `${BASE_URL}/analytics`,
    BY_CASE_STUDY: (caseStudyId: number) => `${BASE_URL}/analytics/case-study/${caseStudyId}`,
    HIT: (username: string) => `${BASE_URL}/analytics/hit/${username}`,
  },
};

// API request handler
const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for authentication
      ...options,
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }

      throw new Error(`API Error: ${errorMessage}`);
    }

    // Return empty object for 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData: any) => 
    apiRequest<any>("POST", ENDPOINTS.AUTH.REGISTER, userData),
  
  login: (credentials: { username: string; password: string }) => 
    apiRequest<any>("POST", ENDPOINTS.AUTH.LOGIN, credentials),
  
  logout: () => 
    apiRequest<void>("POST", ENDPOINTS.AUTH.LOGOUT),
  
  getCurrentUser: () => 
    apiRequest<any>("GET", ENDPOINTS.AUTH.USER),
  
  updateProfile: (profileData: any) => 
    apiRequest<any>("PUT", ENDPOINTS.AUTH.PROFILE, profileData),
  
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => 
    apiRequest<any>("PUT", ENDPOINTS.AUTH.PASSWORD, passwordData),
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: () => 
    apiRequest<any>("GET", ENDPOINTS.PORTFOLIO.BASE),
  
  getPortfolioByUsername: (username: string) => 
    apiRequest<any>("GET", ENDPOINTS.PORTFOLIO.GET_BY_USERNAME(username)),
  
  getCaseStudy: (id: number) => 
    apiRequest<any>("GET", ENDPOINTS.PORTFOLIO.CASE_STUDY(id)),
  
  getCaseStudyBySlug: (username: string, slug: string) => 
    apiRequest<any>("GET", ENDPOINTS.PORTFOLIO.CASE_STUDY_BY_SLUG(username, slug)),
  
  createCaseStudy: (caseStudyData: any) => 
    apiRequest<any>("POST", ENDPOINTS.PORTFOLIO.BASE, caseStudyData),
  
  updateCaseStudy: (id: number, caseStudyData: any) => 
    apiRequest<any>("PUT", ENDPOINTS.PORTFOLIO.CASE_STUDY(id), caseStudyData),
  
  deleteCaseStudy: (id: number) => 
    apiRequest<any>("DELETE", ENDPOINTS.PORTFOLIO.CASE_STUDY(id)),
  
  // Timeline APIs
  addTimelineItem: (caseStudyId: number, timelineData: any) => 
    apiRequest<any>("POST", ENDPOINTS.PORTFOLIO.TIMELINE(caseStudyId), timelineData),
  
  updateTimelineItem: (id: number, timelineData: any) => 
    apiRequest<any>("PUT", ENDPOINTS.PORTFOLIO.TIMELINE_ITEM(id), timelineData),
  
  deleteTimelineItem: (id: number, caseStudyId: number) => 
    apiRequest<any>("DELETE", `${ENDPOINTS.PORTFOLIO.TIMELINE_ITEM(id)}?caseStudyId=${caseStudyId}`),
  
  // Testimonial APIs
  addTestimonial: (caseStudyId: number, testimonialData: any) => 
    apiRequest<any>("POST", ENDPOINTS.PORTFOLIO.TESTIMONIAL(caseStudyId), testimonialData),
  
  // Metric APIs
  addMetric: (caseStudyId: number, metricData: any) => 
    apiRequest<any>("POST", ENDPOINTS.PORTFOLIO.METRIC(caseStudyId), metricData),
};

// Media API
export const mediaAPI = {
  getAllMedia: () => 
    apiRequest<any>("GET", ENDPOINTS.MEDIA.BASE),
  
  getMediaByCaseStudy: (caseStudyId: number) => 
    apiRequest<any>("GET", ENDPOINTS.MEDIA.BY_CASE_STUDY(caseStudyId)),
  
  uploadMedia: (formData: FormData) => {
    // For file uploads, don't set Content-Type header, let browser set it with boundary
    return fetch(ENDPOINTS.MEDIA.UPLOAD, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then(response => {
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    });
  },
  
  uploadMultipleMedia: (formData: FormData) => {
    return fetch(ENDPOINTS.MEDIA.UPLOAD_MULTIPLE, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then(response => {
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    });
  },
  
  deleteMedia: (id: number) => 
    apiRequest<any>("DELETE", ENDPOINTS.MEDIA.DELETE(id)),
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: () => 
    apiRequest<any>("GET", ENDPOINTS.ANALYTICS.BASE),
  
  getCaseStudyAnalytics: (caseStudyId: number) => 
    apiRequest<any>("GET", ENDPOINTS.ANALYTICS.BY_CASE_STUDY(caseStudyId)),
  
  recordPageVisit: (username: string, data?: { caseStudyId?: number; referrer?: string }) => 
    apiRequest<any>("POST", ENDPOINTS.ANALYTICS.HIT(username), data),
};

// Export a combined API object
export default {
  auth: authAPI,
  portfolio: portfolioAPI,
  media: mediaAPI,
  analytics: analyticsAPI,
  
  // Utility to invalidate queries
  invalidateQueries: (queryKey: string | readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  },
};
