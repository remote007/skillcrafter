
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PortfolioCard from "@/components/portfolio/PortfolioCard";
import { useToast } from "@/hooks/use-toast";
import { CaseStudy } from "@shared/schema";

export default function CaseStudies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseStudyToDelete, setCaseStudyToDelete] = useState<CaseStudy | null>(null);
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch case studies");
      return res.json();
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (caseStudyId: number) => {
      return apiRequest("DELETE", `/api/portfolio/${caseStudyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Case study deleted",
        description: "Your case study has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setCaseStudyToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete case study: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (caseStudy: CaseStudy) => {
    setCaseStudyToDelete(caseStudy);
  };

  const confirmDelete = () => {
    if (caseStudyToDelete) {
      deleteMutation.mutate(caseStudyToDelete.id);
    }
  };

  const cancelDelete = () => {
    setCaseStudyToDelete(null);
  };

  const filteredCaseStudies = data?.caseStudies
    ? data.caseStudies.filter((study: CaseStudy) => {
        const matchesSearch = searchTerm === "" || 
          study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          study.summary.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || study.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Case Studies" />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                  Case Studies
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage and organize your portfolio case studies
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/dashboard/case-studies/new">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" /> New Case Study
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative rounded-md shadow-sm flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search case studies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading case studies</p>
                <Button 
                  className="mt-4" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] })}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredCaseStudies.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCaseStudies
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((caseStudy: CaseStudy) => (
                      <PortfolioCard
                        key={caseStudy.id}
                        caseStudy={caseStudy}
                        username={user?.username || ""}
                        isActionable={true}
                        onEdit={() => window.location.href = `/dashboard/case-studies/${caseStudy.id}/edit`}
                        onDelete={() => handleDeleteClick(caseStudy)}
                      />
                    ))}
                </div>
                {filteredCaseStudies.length > ITEMS_PER_PAGE && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.ceil(filteredCaseStudies.length / ITEMS_PER_PAGE) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 text-sm rounded-md ${
                            currentPage === i + 1
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    <p className="text-slate-500 mb-2">No case studies match your filters</p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <FileText className="h-12 w-12 mx-auto text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No case studies</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating your first case study.</p>
                    <div className="mt-6">
                      <Link href="/dashboard/case-studies/new">
                        <Button>
                          <FileText className="h-4 w-4 mr-2" />
                          New Case Study
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <AlertDialog open={!!caseStudyToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the case study "{caseStudyToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
