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
}

const themes = [
  {
    id: "minimal" as ThemeType,
    name: "Minimal",
    description: "Clean, simple design with focus on your work",
    previewImage: "https://res.cloudinary.com/demo/image/upload/minimal-theme-preview.jpg",
  },
  {
    id: "bold" as ThemeType,
    name: "Bold",
    description: "Vibrant colors and modern layout for a strong impression",
    previewImage: "https://res.cloudinary.com/demo/image/upload/bold-theme-preview.jpg",
  },
  {
    id: "classic" as ThemeType,
    name: "Classic",
    description: "Timeless design with elegant typography",
    previewImage: "https://res.cloudinary.com/demo/image/upload/classic-theme-preview.jpg",
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfileMutation } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("minimal");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Set theme based on user preference when logged in
  useEffect(() => {
    if (user && user.theme) {
      setCurrentTheme(user.theme as ThemeType);
    }
  }, [user]);

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
