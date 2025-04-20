import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Clock, ArrowUp, ArrowDown, Globe } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string | null>(null);

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

  // Fetch case study analytics if one is selected
  const { data: caseStudyAnalytics, isLoading: isLoadingCaseStudyAnalytics } = useQuery({
    queryKey: [`/api/analytics/case-study/${selectedCaseStudy}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch case study analytics");
      }

      return res.json();
    },
    enabled: !!user && !!selectedCaseStudy,
  });

  // Color palette for charts
  const COLORS = ['#4F46E5', '#0EA5E9', '#F97316', '#EF4444', '#10B981', '#6D28D9'];

  // Calculate percent change
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get trend data
  const getTrendData = () => {
    if (!analyticsData || !analyticsData.visitsChartData) return {};

    const recentVisits = analyticsData.recentVisits || 0;

    // For simplicity, let's assume a 10% increase as a placeholder
    // In a real app, you would compare current period to previous period
    const previousPeriodVisits = Math.round(recentVisits * 0.9);
    const percentChange = calculatePercentChange(recentVisits, previousPeriodVisits);
    const isPositive = percentChange >= 0;

    return {
      recentVisits,
      percentChange,
      isPositive
    };
  };

  const trendData = getTrendData();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Analytics Dashboard" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                  Analytics Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track your portfolio performance and engagement
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCaseStudy || "all"}
                  onValueChange={(value) => setSelectedCaseStudy(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All case studies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All case studies</SelectItem>
                    {analyticsData?.caseStudyChartData?.map((study: any) => (
                      <SelectItem key={study.id} value={study.id.toString()}>
                        {study.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Views</p>
                      {isLoadingAnalytics ? (
                        <Skeleton className="h-9 w-24 mt-1" />
                      ) : (
                        <h3 className="text-3xl font-bold mt-1">
                          {analyticsData?.totalVisits || 0}
                        </h3>
                      )}
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  {isLoadingAnalytics ? (
                    <Skeleton className="h-5 w-32 mt-2" />
                  ) : (
                    <div className="flex items-center mt-2">
                      {trendData.isPositive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {trendData.percentChange}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {Math.abs(trendData.percentChange || 0)}%
                        </Badge>
                      )}
                      <p className="text-xs text-slate-500 ml-2">vs previous period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Recent Visitors</p>
                      {isLoadingAnalytics ? (
                        <Skeleton className="h-9 w-24 mt-1" />
                      ) : (
                        <h3 className="text-3xl font-bold mt-1">
                          {analyticsData?.recentVisits || 0}
                        </h3>
                      )}
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    In the last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Top Referrers</p>
                      {isLoadingAnalytics ? (
                        <Skeleton className="h-9 w-24 mt-1" />
                      ) : (
                        <h3 className="text-3xl font-bold mt-1">
                          {analyticsData?.referrerChartData?.length || 0}
                        </h3>
                      )}
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  {isLoadingAnalytics ? (
                    <Skeleton className="h-5 w-40 mt-2" />
                  ) : analyticsData?.referrerChartData?.length > 0 ? (
                    <p className="text-xs text-slate-500 mt-2">
                      Top: {analyticsData.referrerChartData[0]?.referrer || "Direct"}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">No referrers recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="referrers">Referrers</TabsTrigger>
                <TabsTrigger value="caseStudies">Case Studies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visits Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="h-72 w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : analyticsData?.visitsChartData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={analyticsData.visitsChartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            stroke="#94a3b8"
                          />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Visits']}
                            labelFormatter={(label: string) => formatDate(label)}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="#4F46E5" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-72 w-full flex items-center justify-center">
                        <p className="text-slate-500">No visits data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referrers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="h-72 w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : analyticsData?.referrerChartData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={analyticsData.referrerChartData.slice(0, 5)}
                          layout="vertical"
                          margin={{
                            top: 5,
                            right: 30,
                            left: 100,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" stroke="#94a3b8" />
                          <YAxis 
                            dataKey="referrer" 
                            type="category" 
                            scale="band" 
                            stroke="#94a3b8"
                            width={90}
                            tickFormatter={(value) => value.length > 13 ? `${value.substring(0, 10)}...` : value}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="visits" fill="#0EA5E9" name="Visits" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-72 w-full flex items-center justify-center">
                        <p className="text-slate-500">No referrer data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="caseStudies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Study Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="h-72 w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : analyticsData?.caseStudyChartData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.caseStudyChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="visits"
                            nameKey="title"
                          >
                            {analyticsData.caseStudyChartData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} visits`, 'Visits']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-72 w-full flex items-center justify-center">
                        <p className="text-slate-500">No case study data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Case Study Details Section */}
            {selectedCaseStudy && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">Case Study Details</h2>

                {isLoadingCaseStudyAnalytics ? (
                  <div className="h-72 w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : caseStudyAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 xl:col-span-3">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{caseStudyAnalytics.caseStudy.title}</CardTitle>
                        <div className="flex items-center space-x-4">
                          <select 
                            className="text-sm border rounded-md p-1"
                            onChange={(e) => setTimeRange(e.target.value)}
                          >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                          </select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={caseStudyAnalytics.visitsChart}>
                              <defs>
                                <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="visits" stroke="#6366f1" fill="url(#visitGradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                      <CardContent>
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">Overview</h3>
                          <p className="text-sm text-slate-500">{caseStudyAnalytics.caseStudy.summary}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Views:</span>
                            <span className="text-sm">{caseStudyAnalytics.totalVisits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Recent Views:</span>
                            <span className="text-sm">{caseStudyAnalytics.recentVisits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge variant={caseStudyAnalytics.caseStudy.status === 'published' ? 'default' : 'secondary'}>
                              {caseStudyAnalytics.caseStudy.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>

                    <Card>
                      <CardHeader>
                        <CardTitle>Visits Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {caseStudyAnalytics.visitsChartData?.length > 0 ? (
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                              data={caseStudyAnalytics.visitsChartData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                stroke="#94a3b8"
                              />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip 
                                formatter={(value: any) => [value, 'Visits']}
                                labelFormatter={(label: string) => formatDate(label)}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="visits" 
                                stroke="#F97316" 
                                activeDot={{ r: 8 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-52 w-full flex items-center justify-center">
                            <p className="text-slate-500">No visits data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-slate-500">No data available for this case study</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}