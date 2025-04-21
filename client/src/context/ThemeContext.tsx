import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

type ThemeType = "minimal" | "bold" | "classic";

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  themesList: {
    id: ThemeType;
    name: string;
    description: string;
    previewImage: string;
  }[];
  isLoading: boolean;
  previewTheme: ThemeType | null;
  handlePreviewTheme: (theme: ThemeType) => void;
}

const themes = [
  {
    id: "minimal" as ThemeType,
    name: "Minimal",
    description: "Clean, simple design with focus on your work",
    previewImage: "https://placehold.co/600x400/f8fafc/334155?text=Minimal+Theme",
  },
  {
    id: "bold" as ThemeType,
    name: "Bold",
    description: "Vibrant colors and modern layout for a strong impression",
    previewImage: "https://placehold.co/600x400/0f172a/f8fafc?text=Bold+Theme",
  },
  {
    id: "classic" as ThemeType,
    name: "Classic",
    description: "Timeless design with elegant typography",
    previewImage: "https://placehold.co/600x400/fafaf9/1c1917?text=Classic+Theme",
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfileMutation } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("minimal");
  const [previewTheme, setPreviewTheme] = useState<ThemeType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Set theme based on user preference when logged in
  useEffect(() => {
    if (user && user.theme) {
      setCurrentTheme(user.theme as ThemeType);
    }
  }, [user]);

  const handlePreviewTheme = (theme: ThemeType) => {
    setPreviewTheme(theme);
  };

  const setTheme = async (theme: ThemeType) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync({ theme });
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Failed to update theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themesList: themes,
        isLoading,
        previewTheme,
        handlePreviewTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
