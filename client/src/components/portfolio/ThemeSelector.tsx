
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeSelector() {
  const { currentTheme, setTheme, themesList, isLoading, handlePreviewTheme, previewTheme } = useTheme();
  
  const activeTheme = previewTheme || currentTheme;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themesList.map((theme) => (
          <Card 
            key={theme.id}
            className={`border-2 ${
              activeTheme === theme.id 
                ? "border-primary" 
                : "border-slate-200 hover:border-slate-300"
            } rounded-lg p-4 cursor-pointer relative transition-all`}
            onClick={() => handlePreviewTheme(theme.id)}
          >
            {activeTheme === theme.id && (
              <div className="absolute top-3 right-3 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-slate-100 rounded overflow-hidden">
              <img 
                src={theme.previewImage} 
                alt={`${theme.name} Theme`} 
                className="object-cover"
              />
            </div>
            <h4 className="font-medium text-slate-800 mb-1">{theme.name}</h4>
            <p className="text-sm text-slate-500">{theme.description}</p>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => handlePreviewTheme(currentTheme)}
          disabled={!previewTheme || isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => setTheme(activeTheme)}
          disabled={!previewTheme || previewTheme === currentTheme || isLoading}
        >
          {isLoading ? "Saving..." : "Save Theme"}
        </Button>
      </div>
    </div>
  );
}
