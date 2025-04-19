import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import MediaGallery from "@/components/portfolio/MediaGallery";
import Timeline from "@/components/portfolio/Timeline";
import MetricsDisplay from "@/components/portfolio/MetricsDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CaseStudyView() {
  const [match, params] = useRoute("/:username/:slug");
  const { currentTheme } = useTheme();
  
  // Fetch case study data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/portfolio/${params?.username}/${params?.slug}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      
      if (!res.ok) {
        throw new Error("Failed to fetch case study");
      }
      
      return res.json();
    },
    enabled: !!params?.username && !!params?.slug,
  });
  
  // Track page visit
  useEffect(() => {
    if (params?.username && params?.slug) {
      // Register analytics hit
      fetch(`/api/analytics/hit/${params.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          referrer: document.referrer,
          caseStudyId: data?.caseStudy?.id
        }),
      }).catch(err => console.error("Failed to record analytics:", err));
    }
  }, [params?.username, params?.slug, data?.caseStudy?.id]);
  
  // Get case study data
  const caseStudy = data?.caseStudy;
  const timelineItems = data?.timelineItems || [];
  const mediaItems = data?.mediaItems || [];
  const testimonials = data?.testimonials || [];
  const metrics = data?.metrics || [];
  const user = data?.user;

  if (!match) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-slate-50 theme-${currentTheme || 'minimal'}`}>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-primary font-bold text-xl">ProjectShelf</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href={`/${params?.username}`} className="text-slate-700 hover:text-primary flex items-center">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="space-y-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full" />
            </div>
            
            <div className="mb-12">
              <Skeleton className="h-64 w-full rounded-lg mb-4" />
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
            
            <div className="mb-10">
              <Skeleton className="h-8 w-40 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Case Study</h2>
            <p className="text-slate-600 mb-6">This case study doesn't exist or there was a problem loading it.</p>
            <Button asChild>
              <Link href={`/${params?.username}`}>Back to Portfolio</Link>
            </Button>
          </div>
        ) : caseStudy ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{caseStudy.title}</h1>
              <p className="text-lg text-slate-600">{caseStudy.summary}</p>
              
              {caseStudy.tags && caseStudy.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {caseStudy.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {mediaItems.length > 0 && (
              <MediaGallery mediaItems={mediaItems} />
            )}

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Project Overview</h2>
              <div className="prose max-w-none text-slate-600">
                {caseStudy.overview ? (
                  <p className="whitespace-pre-line">{caseStudy.overview}</p>
                ) : (
                  <p>No overview provided for this case study.</p>
                )}
              </div>
            </div>

            {timelineItems.length > 0 && (
              <Timeline items={timelineItems} />
            )}

            {caseStudy.tools && caseStudy.tools.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Tools & Technologies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {caseStudy.tools.map((tool: string, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center">
                      <i className="fas fa-tools text-3xl mb-2 text-primary"></i>
                      <span className="text-slate-700 font-medium text-center">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(metrics.length > 0 || testimonials.length > 0) && (
              <MetricsDisplay metrics={metrics} testimonials={testimonials} />
            )}
          </>
        ) : null}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            Portfolio powered by <span className="text-primary font-semibold">ProjectShelf</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
