// Theme definitions for ProjectShelf
interface Theme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cardBackground: string;
    headerBackground: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  borderRadius: string;
  css?: string; // Additional CSS for the theme
}

export const themes: Theme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design with focus on your work',
    previewImage: 'https://res.cloudinary.com/demo/image/upload/minimal-theme-preview.jpg', 
    colors: {
      primary: '#4F46E5',
      secondary: '#0EA5E9',
      accent: '#F97316',
      background: '#F8FAFC',
      text: '#334155',
      cardBackground: '#FFFFFF',
      headerBackground: '#FFFFFF',
    },
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    borderRadius: '0.5rem',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Vibrant colors and modern layout for a strong impression',
    previewImage: 'https://res.cloudinary.com/demo/image/upload/bold-theme-preview.jpg',
    colors: {
      primary: '#6D28D9',
      secondary: '#4F46E5',
      accent: '#EC4899',
      background: '#0F172A',
      text: '#F8FAFC',
      cardBackground: '#1E293B',
      headerBackground: '#0F172A',
    },
    typography: {
      headingFont: 'Montserrat, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    borderRadius: '0.25rem',
    css: `
      .portfolio-card {
        transition: transform 0.3s ease;
      }
      .portfolio-card:hover {
        transform: translateY(-5px);
      }
    `
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless design with elegant typography',
    previewImage: 'https://res.cloudinary.com/demo/image/upload/classic-theme-preview.jpg',
    colors: {
      primary: '#10B981',
      secondary: '#064E3B',
      accent: '#F59E0B',
      background: '#FAFAF9',
      text: '#1C1917',
      cardBackground: '#FFFFFF',
      headerBackground: '#FFFFFF',
    },
    typography: {
      headingFont: 'Merriweather, serif',
      bodyFont: 'Lora, serif',
    },
    borderRadius: '0.125rem',
    css: `
      h1, h2, h3, h4, h5, h6 {
        font-weight: 700;
      }
      .portfolio-card {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    `
  }
];

/**
 * Get a theme by ID
 * @param themeId The ID of the theme to retrieve
 * @returns The theme object or the default minimal theme if not found
 */
export function getThemeById(themeId: string): Theme {
  const theme = themes.find(t => t.id === themeId);
  return theme || themes[0]; // Return minimal theme as default
}

/**
 * Generate CSS variables for a theme
 * @param themeId The ID of the theme
 * @returns CSS string with variables
 */
export function generateThemeCSS(themeId: string): string {
  const theme = getThemeById(themeId);
  
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-text: ${theme.colors.text};
      --color-card-background: ${theme.colors.cardBackground};
      --color-header-background: ${theme.colors.headerBackground};
      --font-heading: ${theme.typography.headingFont};
      --font-body: ${theme.typography.bodyFont};
      --border-radius: ${theme.borderRadius};
    }
    
    /* Base theme styles */
    body {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-body);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
    }
    
    /* Additional theme specific styles */
    ${theme.css || ''}
  `;
}
