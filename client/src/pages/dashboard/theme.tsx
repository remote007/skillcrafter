import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/ThemeContext";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import ThemeSelector from "@/components/portfolio/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ThemeSettings() {
  const { user } = useAuth();
  const { currentTheme, setTheme, isLoading } = useTheme();
  const { toast } = useToast();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Handle theme change
  const handleSaveTheme = async () => {
    if (!previewTheme || previewTheme === currentTheme) {
      toast({
        title: "No changes to save",
        description: "Please select a different theme to save changes",
      });
      return;
    }
    
    setSaveLoading(true);
    try {
      await setTheme(previewTheme as any);
      toast({
        title: "Theme updated",
        description: "Your portfolio theme has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Handle theme preview
  const handlePreviewChange = (themeId: string) => {
    setPreviewTheme(themeId);
  };
  
  // Determine which theme to display in the preview
  const displayTheme = previewTheme || currentTheme;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Theme Settings" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-800">Select a theme for your portfolio</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a theme that best represents your style and work.</p>
              </div>
              
              <div className="p-6">
                <ThemeSelector />
              </div>
            </div>
            
            <Card className="mb-8">
              <CardContent className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-800">Preview</h3>
                <p className="mt-1 text-sm text-slate-500">See how your portfolio will look with the selected theme.</p>
              </CardContent>
              
              <div className="p-6">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-xs text-slate-500">
                      projectshelf.com/{user?.username || 'username'}
                    </div>
                  </div>
                  <div className={`p-4 bg-slate-50 ${displayTheme ? `theme-${displayTheme}` : 'theme-minimal'}`}>
                    {/* Theme minimal preview */}
                    <div className="rounded-lg overflow-hidden shadow-sm mb-4">
                      <div className="h-36 bg-slate-200 flex items-center justify-center text-slate-400">
                        <span>Header Image</span>
                      </div>
                      <div className="bg-white p-4">
                        <h3 className="text-lg font-semibold mb-2">Portfolio Title</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          This is how your portfolio will look with the {displayTheme || 'minimal'} theme.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Tag 1</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Tag 2</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Tag 3</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg overflow-hidden shadow-sm">
                        <div className="h-24 bg-slate-200 flex items-center justify-center text-slate-400">
                          <span>Image</span>
                        </div>
                        <div className="bg-white p-3">
                          <h4 className="text-md font-medium mb-1">Case Study 1</h4>
                          <p className="text-xs text-slate-500">Brief description of the case study</p>
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden shadow-sm">
                        <div className="h-24 bg-slate-200 flex items-center justify-center text-slate-400">
                          <span>Image</span>
                        </div>
                        <div className="bg-white p-3">
                          <h4 className="text-md font-medium mb-1">Case Study 2</h4>
                          <p className="text-xs text-slate-500">Brief description of the case study</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-3"
                onClick={() => setPreviewTheme(null)}
                disabled={!previewTheme}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTheme}
                disabled={!previewTheme || isLoading || saveLoading}
              >
                {isLoading || saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Theme
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
