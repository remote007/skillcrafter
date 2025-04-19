import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save, Plus, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewCaseStudy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
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

  const [newTool, setNewTool] = useState("");
  const [newTag, setNewTag] = useState("");

  // Handle tools and tags
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCaseStudyData({
      ...caseStudyData,
      [name]: value,
    });
  };

  // Create case study mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/portfolio", data);
      if (!response?.caseStudy?.id) {
        throw new Error("No case study ID returned from server");
      }
      return response;
    },
    onSuccess: (response: any) => {
      console.log("Create response:", response);
      if (!response?.caseStudy?.id) {
        throw new Error("No case study ID in success response");
      }
      toast({
        title: "Success", 
        description: "Case study created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      navigate(`/dashboard/case-studies/${response.caseStudy.id}/edit`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create case study: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = () => {
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

    createMutation.mutate({
      ...caseStudyData,
      slug,
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="New Case Study" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/case-studies")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Case Studies
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Case Study
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Case Study Details</h2>

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
                      rows={8}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
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
                        <p className="text-xs text-slate-500 mt-1">
                          Leave empty to auto-generate from title
                        </p>
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
                  </div>

                  <div className="border rounded-lg p-6">
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
                  </div>

                  <div className="border rounded-lg p-6">
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
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <p className="text-slate-500 mb-4">
                  After creating your case study, you'll be able to add timeline items, outcome metrics, testimonials, and media.
                </p>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Create Case Study
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}