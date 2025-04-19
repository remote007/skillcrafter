import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import PortfolioCard from "@/components/portfolio/PortfolioCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/context/ThemeContext";
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Instagram, 
  Globe, 
  Loader2
} from "lucide-react";

export default function PublicPortfolio() {
  const [match, params] = useRoute("/:username");
  const { currentTheme } = useTheme();
  
  // Fetch portfolio data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/portfolio/${params?.username}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      
      if (!res.ok) {
        throw new Error("Failed to fetch portfolio");
      }
      
      return res.json();
    },
    enabled: !!params?.username,
  });
  
  // Track page visit
  useEffect(() => {
    if (params?.username) {
      // Register analytics hit
      fetch(`/api/analytics/hit/${params.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referrer: document.referrer }),
      }).catch(err => console.error("Failed to record analytics:", err));
    }
  }, [params?.username]);
  
  // Get user data from the response
  const user = data?.user;
  const caseStudies = data?.caseStudies || [];
  
  // Get published case studies only
  const publishedCaseStudies = caseStudies.filter((study: any) => study.status === "published");
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "?";
    
    const names = user.name.split(" ");
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };
  
  // Check if social links exist
  const hasSocialLinks = user?.socialLinks && Object.values(user.socialLinks).some(link => !!link);

  if (!match) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-slate-50 theme-${currentTheme || 'minimal'}`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="mb-12 text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-2" />
            <Skeleton className="h-4 w-3/4 max-w-2xl mx-auto mb-4" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-red-500">Error Loading Portfolio</h2>
            <p className="text-slate-600 mt-2">This user doesn't exist or there was a problem loading their portfolio.</p>
          </div>
        ) : user ? (
          <div className="mb-12 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{user.bio}</p>
            
            {hasSocialLinks && (
              <div className="flex justify-center space-x-4 mt-4">
                {user.socialLinks?.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks?.instagram && (
                  <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks?.website && (
                  <a href={user.socialLinks.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : null}

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Case Studies</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-14 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-white rounded-lg shadow">
              <p className="text-slate-600">Failed to load case studies.</p>
            </div>
          ) : publishedCaseStudies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedCaseStudies.map((study: any) => (
                <PortfolioCard 
                  key={study.id} 
                  caseStudy={study} 
                  username={params?.username || ""} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-lg shadow">
              <p className="text-slate-600">No case studies available yet.</p>
            </div>
          )}
        </div>
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
