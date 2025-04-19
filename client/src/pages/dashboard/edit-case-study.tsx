import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Eye, ArrowLeft, Plus, X, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditCaseStudy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/dashboard/case-studies/:id/edit");
  const [activeTab, setActiveTab] = useState("overview");
  const [caseStudyData, setCaseStudyData] = useState({
    title: "",
    summary: "",
    overview: "",
    coverImage: "",
    slug: "",
    status: "draft",
    tools: [] as string[],
    tags: [] as string[],
  });
  
  // Timeline Management
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [currentTimelineItem, setCurrentTimelineItem] = useState({
    id: 0,
    title: "",
    description: "",
    date: "",
    order: 0,
    isEditing: false,
  });
  
  // Testimonials Management
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState({
    id: 0,
    text: "",
    author: "",
    position: "",
    isEditing: false,
  });
  
  // Metrics Management
  const [metrics, setMetrics] = useState<any[]>([]);
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [currentMetric, setCurrentMetric] = useState({
    id: 0,
    title: "",
    value: "",
    subtitle: "",
    icon: "",
    isEditing: false,
  });
  
  // Media Management
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [newTool, setNewTool] = useState("");
  const [newTag, setNewTag] = useState("");
  
  // Tools and Tags Input
  const handleAddTool = () => {
    if (newTool.trim() && !caseStudyData.tools.includes(newTool.trim())) {
      setCaseStudyData({
        ...caseStudyData,
        tools: [...caseStudyData.tools, newTool.trim()],
      });
      setNewTool("");
    }
  };
  
  const handleRemoveTool = (toolToRemove: string) => {
    setCaseStudyData({
      ...caseStudyData,
      tools: caseStudyData.tools.filter(tool => tool !== toolToRemove),
    });
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !caseStudyData.tags.includes(newTag.trim())) {
      setCaseStudyData({
        ...caseStudyData,
        tags: [...caseStudyData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setCaseStudyData({
      ...caseStudyData,
      tags: caseStudyData.tags.filter(tag => tag !== tagToRemove),
    });
  };
  
  const caseStudyId = params?.id ? parseInt(params.id, 10) : 0;
  
  // Fetch case study data
  const { isLoading, error } = useQuery({
    queryKey: [`/api/portfolio/case-study/${caseStudyId}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch case study");
      }
      
      const data = await res.json();
      
      // Set up case study data
      setCaseStudyData({
        title: data.caseStudy.title || "",
        summary: data.caseStudy.summary || "",
        overview: data.caseStudy.overview || "",
        coverImage: data.caseStudy.coverImage || "",
        slug: data.caseStudy.slug || "",
        status: data.caseStudy.status || "draft",
        tools: Array.isArray(data.caseStudy.tools) ? data.caseStudy.tools : [],
        tags: Array.isArray(data.caseStudy.tags) ? data.caseStudy.tags : [],
      });
      
      // Set up timeline items
      if (data.timelineItems && data.timelineItems.length > 0) {
        setTimelineItems(data.timelineItems);
      }
      
      // Set up testimonials
      if (data.testimonials && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
      }
      
      // Set up metrics
      if (data.metrics && data.metrics.length > 0) {
        setMetrics(data.metrics);
      }
      
      // Set up media
      if (data.mediaItems && data.mediaItems.length > 0) {
        setMediaItems(data.mediaItems);
      }
      
      return data;
    },
    enabled: !!user && !!caseStudyId,
  });
  
  // Fetch media for the case study
  const { data: mediaData } = useQuery({
    queryKey: [`/api/media/case-study/${caseStudyId}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch media");
      }
      
      return res.json();
    },
    enabled: !!user && !!caseStudyId,
  });
  
  // Update media items when data is loaded
  useEffect(() => {
    if (mediaData && mediaData.media) {
      setMediaItems(mediaData.media);
    }
  }, [mediaData]);
  
  // Update case study mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/portfolio/${caseStudyId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/case-study/${caseStudyId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update case study: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Timeline item mutations
  const addTimelineItemMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/portfolio/${caseStudyId}/timeline`, data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Timeline item added successfully",
      });
      setTimelineItems([...timelineItems, data.timelineItem]);
      setTimelineDialogOpen(false);
      clearTimelineForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add timeline item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateTimelineItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/portfolio/timeline/${id}`, data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Timeline item updated successfully",
      });
      setTimelineItems(timelineItems.map(item => 
        item.id === data.timelineItem.id ? data.timelineItem : item
      ));
      setTimelineDialogOpen(false);
      clearTimelineForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update timeline item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteTimelineItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/portfolio/timeline/${id}?caseStudyId=${caseStudyId}`);
    },
    onSuccess: (_, id) => {
      toast({
        title: "Success",
        description: "Timeline item deleted successfully",
      });
      setTimelineItems(timelineItems.filter(item => item.id !== id));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete timeline item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Testimonial mutations
  const addTestimonialMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/portfolio/${caseStudyId}/testimonial`, data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Testimonial added successfully",
      });
      setTestimonials([...testimonials, data.testimonial]);
      setTestimonialDialogOpen(false);
      clearTestimonialForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add testimonial: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Metric mutations
  const addMetricMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/portfolio/${caseStudyId}/metric`, data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Metric added successfully",
      });
      setMetrics([...metrics, data.metric]);
      setMetricDialogOpen(false);
      clearMetricForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add metric: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCaseStudyData({
      ...caseStudyData,
      [name]: value,
    });
  };
  
  // Handle timeline form
  const clearTimelineForm = () => {
    setCurrentTimelineItem({
      id: 0,
      title: "",
      description: "",
      date: "",
      order: timelineItems.length + 1,
      isEditing: false,
    });
  };
  
  const openTimelineDialog = (item?: any) => {
    if (item) {
      setCurrentTimelineItem({
        ...item,
        isEditing: true,
      });
    } else {
      clearTimelineForm();
    }
    setTimelineDialogOpen(true);
  };
  
  const handleTimelineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTimelineItem({
      ...currentTimelineItem,
      [name]: value,
    });
  };
  
  const submitTimelineForm = () => {
    if (!currentTimelineItem.title || !currentTimelineItem.date) {
      toast({
        title: "Error",
        description: "Title and date are required for timeline items",
        variant: "destructive",
      });
      return;
    }
    
    const { isEditing, ...data } = currentTimelineItem;
    
    if (isEditing) {
      updateTimelineItemMutation.mutate({ id: data.id, data: { ...data, caseStudyId } });
    } else {
      addTimelineItemMutation.mutate({ ...data, caseStudyId });
    }
  };
  
  // Handle testimonial form
  const clearTestimonialForm = () => {
    setCurrentTestimonial({
      id: 0,
      text: "",
      author: "",
      position: "",
      isEditing: false,
    });
  };
  
  const openTestimonialDialog = (item?: any) => {
    if (item) {
      setCurrentTestimonial({
        ...item,
        isEditing: true,
      });
    } else {
      clearTestimonialForm();
    }
    setTestimonialDialogOpen(true);
  };
  
  const handleTestimonialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTestimonial({
      ...currentTestimonial,
      [name]: value,
    });
  };
  
  const submitTestimonialForm = () => {
    if (!currentTestimonial.text || !currentTestimonial.author) {
      toast({
        title: "Error",
        description: "Testimonial text and author are required",
        variant: "destructive",
      });
      return;
    }
    
    const { isEditing, ...data } = currentTestimonial;
    
    if (isEditing) {
      // Implement update later
      toast({
        title: "Info",
        description: "Updating testimonials is not implemented yet",
      });
    } else {
      addTestimonialMutation.mutate({ ...data, caseStudyId });
    }
  };
  
  // Handle metric form
  const clearMetricForm = () => {
    setCurrentMetric({
      id: 0,
      title: "",
      value: "",
      subtitle: "",
      icon: "",
      isEditing: false,
    });
  };
  
  const openMetricDialog = (item?: any) => {
    if (item) {
      setCurrentMetric({
        ...item,
        isEditing: true,
      });
    } else {
      clearMetricForm();
    }
    setMetricDialogOpen(true);
  };
  
  const handleMetricFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMetric({
      ...currentMetric,
      [name]: value,
    });
  };
  
  const submitMetricForm = () => {
    if (!currentMetric.title || !currentMetric.value) {
      toast({
        title: "Error",
        description: "Metric title and value are required",
        variant: "destructive",
      });
      return;
    }
    
    const { isEditing, ...data } = currentMetric;
    
    if (isEditing) {
      // Implement update later
      toast({
        title: "Info",
        description: "Updating metrics is not implemented yet",
      });
    } else {
      addMetricMutation.mutate({ ...data, caseStudyId });
    }
  };
  
  // Handle case study update
  const handleUpdate = () => {
    if (!caseStudyData.title || !caseStudyData.summary) {
      toast({
        title: "Error",
        description: "Title and summary are required",
        variant: "destructive",
      });
      return;
    }
    
    // Generate slug if empty
    let slug = caseStudyData.slug;
    if (!slug) {
      slug = caseStudyData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    
    updateMutation.mutate({
      ...caseStudyData,
      slug,
    });
  };
  
  // Handle preview click
  const handlePreview = () => {
    if (user && caseStudyData.slug) {
      window.open(`/${user.username}/${caseStudyData.slug}`, '_blank');
    }
  };

  if (!match) {
    navigate("/dashboard/case-studies");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Edit Case Study" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-8">
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/case-studies")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Case Studies
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!caseStudyData.slug}
                >
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button 
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading case study</p>
                <Button 
                  className="mt-4" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/portfolio/case-study/${caseStudyId}`] })}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start border-b rounded-none p-0">
                    <TabsTrigger 
                      value="overview" 
                      className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="timeline" 
                      className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger 
                      value="outcomes" 
                      className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      Outcomes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="media" 
                      className="rounded-none rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      Media
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            name="title"
                            value={caseStudyData.title}
                            onChange={handleInputChange}
                            placeholder="Enter case study title"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="summary">Summary</Label>
                          <Textarea
                            id="summary"
                            name="summary"
                            value={caseStudyData.summary}
                            onChange={handleInputChange}
                            placeholder="A brief summary of your case study"
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="overview">Project Overview</Label>
                          <Textarea
                            id="overview"
                            name="overview"
                            value={caseStudyData.overview}
                            onChange={handleInputChange}
                            placeholder="Detailed description of your project"
                            className="mt-1"
                            rows={10}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Settings</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="slug">URL Slug</Label>
                                <div className="flex items-center mt-1">
                                  <span className="text-slate-500 text-sm mr-1">
                                    /{user?.username}/
                                  </span>
                                  <Input
                                    id="slug"
                                    name="slug"
                                    value={caseStudyData.slug}
                                    onChange={handleInputChange}
                                    placeholder="url-slug"
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                  value={caseStudyData.status}
                                  onValueChange={(value) => 
                                    setCaseStudyData({...caseStudyData, status: value})
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="coverImage">Cover Image URL</Label>
                                <Input
                                  id="coverImage"
                                  name="coverImage"
                                  value={caseStudyData.coverImage}
                                  onChange={handleInputChange}
                                  placeholder="https://example.com/image.jpg"
                                  className="mt-1"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                  Upload images in the Media tab
                                </p>
                              </div>
                              
                              {caseStudyData.coverImage && (
                                <div className="mt-2">
                                  <img
                                    src={caseStudyData.coverImage}
                                    alt="Cover Preview"
                                    className="w-full h-auto rounded-md border border-slate-200"
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Tools & Technologies</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {caseStudyData.tools.map((tool, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {tool}
                                  <button 
                                    onClick={() => handleRemoveTool(tool)}
                                    className="text-slate-500 hover:text-slate-700 ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add tool or technology"
                                value={newTool}
                                onChange={(e) => setNewTool(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={handleAddTool}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {caseStudyData.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                  {tag}
                                  <button 
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-slate-500 hover:text-slate-700 ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={handleAddTag}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Project Timeline</h2>
                      <Button onClick={() => openTimelineDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Timeline Item
                      </Button>
                    </div>
                    
                    {timelineItems.length === 0 ? (
                      <div className="text-center p-12 border border-dashed rounded-md">
                        <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No Timeline Items</h3>
                        <p className="text-slate-500 mb-4">Add timeline items to show the process and journey of your project.</p>
                        <Button onClick={() => openTimelineDialog()}>
                          <Plus className="mr-2 h-4 w-4" /> Add First Item
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {timelineItems
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((item, index, array) => (
                            <div key={item.id} className="flex group">
                              <div className="flex flex-col items-center mr-4">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                {index < array.length - 1 && (
                                  <div className="w-0.5 h-full bg-slate-200"></div>
                                )}
                              </div>
                              <div className="pb-6 flex-1">
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                                    <span className="text-sm text-slate-500">{item.date}</span>
                                  </div>
                                  <p className="text-slate-600">{item.description}</p>
                                  <div className="mt-4 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => openTimelineDialog(item)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => deleteTimelineItemMutation.mutate(item.id)}
                                      disabled={deleteTimelineItemMutation.isPending}
                                    >
                                      {deleteTimelineItemMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Outcomes Tab */}
                  <TabsContent value="outcomes" className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Metrics Section */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">Key Metrics</h2>
                          <Button onClick={() => openMetricDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Metric
                          </Button>
                        </div>
                        
                        <Card>
                          <CardContent className="p-6">
                            {metrics.length === 0 ? (
                              <div className="text-center p-8">
                                <p className="text-slate-500 mb-4">No metrics added yet</p>
                                <Button onClick={() => openMetricDialog()}>
                                  <Plus className="mr-2 h-4 w-4" /> Add Metric
                                </Button>
                              </div>
                            ) : (
                              <ul className="space-y-3">
                                {metrics.map((metric) => (
                                  <li key={metric.id} className="flex items-center group">
                                    <div className="bg-green-100 rounded-full p-2 mr-3">
                                      <i className={metric.icon || "fas fa-chart-line"} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="block text-slate-800 font-semibold">{metric.value}</span>
                                      <span className="text-sm text-slate-500">{metric.subtitle}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => openMetricDialog(metric)}
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Testimonials Section */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">Testimonials</h2>
                          <Button onClick={() => openTestimonialDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                          </Button>
                        </div>
                        
                        <Card>
                          <CardContent className="p-6">
                            {testimonials.length === 0 ? (
                              <div className="text-center p-8">
                                <p className="text-slate-500 mb-4">No testimonials added yet</p>
                                <Button onClick={() => openTestimonialDialog()}>
                                  <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {testimonials.map((testimonial, index) => (
                                  <div 
                                    key={testimonial.id} 
                                    className={`group ${index < testimonials.length - 1 ? "pb-4 border-b border-slate-100" : ""}`}
                                  >
                                    <div className="flex justify-between">
                                      <p className="text-slate-600 italic mb-2">{testimonial.text}</p>
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => openTestimonialDialog(testimonial)}
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                      — {testimonial.author}
                                      {testimonial.position && `, ${testimonial.position}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Media Tab */}
                  <TabsContent value="media" className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Media Gallery</h2>
                      <Button disabled>
                        <Plus className="mr-2 h-4 w-4" /> Upload Media
                      </Button>
                    </div>
                    
                    <p className="mb-6 text-slate-500">
                      Coming soon: Media upload and management. For now, please use the Cover Image URL field in the Overview tab.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaItems.map((media) => (
                        <div key={media.id} className="border rounded-md overflow-hidden">
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt={media.name} 
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <video 
                              src={media.url} 
                              className="w-full h-48 object-cover"
                              controls
                            />
                          )}
                          <div className="p-2">
                            <p className="truncate text-sm">{media.name}</p>
                            <div className="flex justify-between mt-2">
                              <button 
                                className="text-primary text-sm hover:underline"
                                onClick={() => {
                                  setCaseStudyData({
                                    ...caseStudyData,
                                    coverImage: media.url
                                  });
                                  setActiveTab("overview");
                                  toast({
                                    title: "Cover image set",
                                    description: "The selected image has been set as the cover image",
                                  });
                                }}
                              >
                                Set as cover
                              </button>
                              <button className="text-red-500 text-sm hover:underline" disabled>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Timeline Item Dialog */}
      <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentTimelineItem.isEditing ? "Edit Timeline Item" : "Add Timeline Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="timelineTitle">Title</Label>
              <Input
                id="timelineTitle"
                name="title"
                value={currentTimelineItem.title}
                onChange={handleTimelineFormChange}
                placeholder="e.g. Research Phase"
              />
            </div>
            <div>
              <Label htmlFor="timelineDate">Date</Label>
              <Input
                id="timelineDate"
                name="date"
                value={currentTimelineItem.date}
                onChange={handleTimelineFormChange}
                placeholder="e.g. January 2023 or Q1 2023"
              />
            </div>
            <div>
              <Label htmlFor="timelineDescription">Description</Label>
              <Textarea
                id="timelineDescription"
                name="description"
                value={currentTimelineItem.description}
                onChange={handleTimelineFormChange}
                placeholder="Describe this phase of the project"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="timelineOrder">Order</Label>
              <Input
                id="timelineOrder"
                name="order"
                type="number"
                value={currentTimelineItem.order}
                onChange={handleTimelineFormChange}
                placeholder="Order in timeline"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimelineDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitTimelineForm}
              disabled={addTimelineItemMutation.isPending || updateTimelineItemMutation.isPending}
            >
              {(addTimelineItemMutation.isPending || updateTimelineItemMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Testimonial Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentTestimonial.isEditing ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="testimonialText">Testimonial</Label>
              <Textarea
                id="testimonialText"
                name="text"
                value={currentTestimonial.text}
                onChange={handleTestimonialFormChange}
                placeholder="The testimonial text"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="testimonialAuthor">Author</Label>
              <Input
                id="testimonialAuthor"
                name="author"
                value={currentTestimonial.author}
                onChange={handleTestimonialFormChange}
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <Label htmlFor="testimonialPosition">Position (Optional)</Label>
              <Input
                id="testimonialPosition"
                name="position"
                value={currentTestimonial.position}
                onChange={handleTestimonialFormChange}
                placeholder="e.g. CEO, Company Name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitTestimonialForm}
              disabled={addTestimonialMutation.isPending}
            >
              {addTestimonialMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Metric Dialog */}
      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentMetric.isEditing ? "Edit Metric" : "Add Metric"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="metricTitle">Title</Label>
              <Input
                id="metricTitle"
                name="title"
                value={currentMetric.title}
                onChange={handleMetricFormChange}
                placeholder="e.g. Downloads"
              />
            </div>
            <div>
              <Label htmlFor="metricValue">Value</Label>
              <Input
                id="metricValue"
                name="value"
                value={currentMetric.value}
                onChange={handleMetricFormChange}
                placeholder="e.g. 25,000+"
              />
            </div>
            <div>
              <Label htmlFor="metricSubtitle">Subtitle (Optional)</Label>
              <Input
                id="metricSubtitle"
                name="subtitle"
                value={currentMetric.subtitle}
                onChange={handleMetricFormChange}
                placeholder="e.g. In first 3 months"
              />
            </div>
            <div>
              <Label htmlFor="metricIcon">Icon (Optional)</Label>
              <Input
                id="metricIcon"
                name="icon"
                value={currentMetric.icon}
                onChange={handleMetricFormChange}
                placeholder="e.g. fas fa-download"
              />
              <p className="text-xs text-slate-500 mt-1">
                Use FontAwesome icon classes (e.g. fas fa-download)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMetricDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitMetricForm}
              disabled={addMetricMutation.isPending}
            >
              {addMetricMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
