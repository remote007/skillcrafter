import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Eye,
  Folder,
  Download,
  Edit,
  ExternalLink,
  Calendar,
  Image,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch portfolio data
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch portfolio data");
      }
      
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      return res.json();
    },
    enabled: !!user,
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get time ago helper
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar toggleSidebar={toggleSidebar} title="Dashboard Overview" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                  Welcome, {user?.name}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Here's an overview of your portfolio and recent activity
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

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Eye className="text-primary h-6 w-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingAnalytics ? (
                        <>
                          <Skeleton className="h-6 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </>
                      ) : (
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Total Profile Views
                          </dt>
                          <dd className="text-lg font-medium text-slate-900">
                            {analyticsData?.totalVisits || 0}
                          </dd>
                        </dl>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 px-5 py-3">
                  <Link href="/dashboard/analytics" className="text-sm font-medium text-primary hover:text-indigo-700">
                    View details <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Folder className="text-primary h-6 w-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingPortfolio ? (
                        <>
                          <Skeleton className="h-6 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </>
                      ) : (
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Case Studies
                          </dt>
                          <dd className="text-lg font-medium text-slate-900">
                            {portfolioData?.caseStudies?.length || 0}
                          </dd>
                        </dl>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 px-5 py-3">
                  <Link href="/dashboard/case-studies" className="text-sm font-medium text-primary hover:text-indigo-700">
                    Manage <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Download className="text-primary h-6 w-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      {isLoadingAnalytics ? (
                        <>
                          <Skeleton className="h-6 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </>
                      ) : (
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Recent Visitors
                          </dt>
                          <dd className="text-lg font-medium text-slate-900">
                            {analyticsData?.recentVisits || 0}
                          </dd>
                        </dl>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 px-5 py-3">
                  <Link href="/dashboard/analytics" className="text-sm font-medium text-primary hover:text-indigo-700">
                    View all <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mb-8">
              <CardContent className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-800">Recent Activity</h3>
              </CardContent>
              <div className="divide-y divide-slate-200">
                {isLoadingAnalytics ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-5 py-4 flex items-start">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : analyticsData?.recentVisits > 0 ? (
                  <>
                    <div className="px-5 py-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <Eye className="text-blue-500 h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">
                            <span className="font-semibold">{analyticsData?.recentVisits} visitors</span> viewed your portfolio
                          </p>
                          <p className="text-sm text-slate-500">
                            In the last 30 days
                          </p>
                        </div>
                        <div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Analytics
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {analyticsData?.caseStudyChartData?.slice(0, 2).map((item: any, index: number) => (
                      <div key={index} className="px-5 py-4">
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-2 mr-3">
                            <FileText className="text-green-500 h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">
                              Your case study <span className="font-semibold">{item.title}</span> received {item.visits} views
                            </p>
                            <p className="text-sm text-slate-500">
                              Recently
                            </p>
                          </div>
                          <div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Content
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-slate-500">No recent activity to show</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Case Studies Table */}
            <Card className="mb-8">
              <CardContent className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800">My Case Studies</h3>
                <Link href="/dashboard/case-studies" className="text-sm font-medium text-primary hover:text-indigo-700">
                  View all
                </Link>
              </CardContent>
              <div className="overflow-x-auto">
                {isLoadingPortfolio ? (
                  <div className="p-8">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : portfolioData?.caseStudies?.length > 0 ? (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {portfolioData.caseStudies.slice(0, 3).map((study: any) => {
                        // Find analytics for this case study
                        const studyAnalytics = analyticsData?.caseStudyChartData?.find(
                          (item: any) => item.id === study.id
                        );
                        
                        return (
                          <tr key={study.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={study.coverImage || "https://via.placeholder.com/100?text=No+Image"} 
                                    alt={study.title} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900">{study.title}</div>
                                  <div className="text-sm text-slate-500 truncate max-w-xs">{study.summary}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className={
                                study.status === "published" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }>
                                {study.status === "published" ? "Published" : "Draft"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {studyAnalytics?.visits || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {getTimeAgo(study.updatedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-3">
                                <Link href={`/dashboard/case-studies/${study.id}/edit`} className="text-primary hover:text-indigo-700">
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <Link href={`/${user?.username}/${study.slug}`} className="text-slate-500 hover:text-slate-700">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 mx-auto text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No case studies</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating a new case study.</p>
                    <div className="mt-6">
                      <Link href="/dashboard/case-studies/new">
                        <Button>
                          <FileText className="h-4 w-4 mr-2" />
                          New Case Study
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
