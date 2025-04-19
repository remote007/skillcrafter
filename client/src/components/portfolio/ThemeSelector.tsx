import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Check } from "lucide-react";

export default function ThemeSelector() {
  const { currentTheme, setTheme, themesList, isLoading } = useTheme();
  
  const handleThemeSelect = async (themeId: "minimal" | "bold" | "classic") => {
    await setTheme(themeId);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {themesList.map((theme) => (
        <Card 
          key={theme.id}
          className={`border-2 ${
            currentTheme === theme.id 
              ? "border-primary" 
              : "border-slate-200 hover:border-slate-300"
          } rounded-lg p-4 cursor-pointer relative`}
          onClick={() => handleThemeSelect(theme.id)}
        >
          {currentTheme === theme.id && (
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
  );
}
