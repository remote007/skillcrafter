import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import PublicPortfolio from "@/pages/public-portfolio";
import CaseStudyView from "@/pages/case-study-view";

// Dashboard Pages
import Dashboard from "@/pages/dashboard";
import CaseStudies from "@/pages/dashboard/case-studies";
import NewCaseStudy from "@/pages/dashboard/new-case-study";
import EditCaseStudy from "@/pages/dashboard/edit-case-study";
import MediaLibrary from "@/pages/dashboard/media";
import AnalyticsDashboard from "@/pages/dashboard/analytics";
import ThemeSettings from "@/pages/dashboard/theme";
import Profile from "@/pages/dashboard/profile";

function Router() {
  return (
    <Switch>
      {/* Public Routes - Auth must come before any dynamic username routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/:tab" component={AuthPage} />
      
      {/* Protected Dashboard Routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/case-studies" component={CaseStudies} />
      <ProtectedRoute path="/dashboard/case-studies/new" component={NewCaseStudy} />
      <ProtectedRoute path="/dashboard/case-studies/:id/edit" component={EditCaseStudy} />
      <ProtectedRoute path="/dashboard/media" component={MediaLibrary} />
      <ProtectedRoute path="/dashboard/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/dashboard/theme" component={ThemeSettings} />
      <ProtectedRoute path="/dashboard/profile" component={Profile} />
      
      {/* Public Portfolio Routes - keep these after dashboard routes and auth to prevent conflicts */}
      <Route path="/:username/:slug" component={CaseStudyView} />
      <Route path="/:username" component={PublicPortfolio} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
