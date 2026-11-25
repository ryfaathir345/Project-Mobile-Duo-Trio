import { Platform } from 'react-native';

/**
 * Kafe Koding Design System Tokens
 * Palette bernuansa natural coffeehouse (espresso, mocha, warm linen, amber)
 * Mengikuti Anti-AI-Slop Standard & Responsive Web/Mobile guidelines.
 */

export const CoffeeTheme = {
  colors: {
    // Canvas & Surfaces
    canvas: '#fbfaf8',
    surface: '#ffffff',
    surfaceSubtle: '#f5f2eb',
    surfaceMuted: '#ece7de',
    
    // Structural Borders (1px clean dividing lines)
    border: '#e7e2d8',
    borderSubtle: '#f0ece4',
    borderProminent: '#d5cec2',

    // Typographic Colors
    textPrimary: '#26201b',    // Deep espresso
    textSecondary: '#6e665e',  // Warm roasted stone
    textMuted: '#968d83',      // Subtle caption / helper
    textInverse: '#ffffff',

    // Brand Accents
    brand: '#543310',          // Rich dark roast
    brandHover: '#40260c',
    brandSecondary: '#784315',  // Medium roast
    brandSubtle: '#fdf6ee',    // Tint background
    
    // Semantic / Natural Status
    accentAmber: '#b45309',    // Natural caramel / star rating
    accentAmberBg: '#fef3c7',
    spicyRed: '#b91c1c',       // Muted warm chili
    spicyRedBg: '#fef2f2',
    spicyRedBorder: '#fecaca',
    successGreen: '#15803d',
    successGreenBg: '#f0fdf4',
    successGreenBorder: '#bbf7d0',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  layout: {
    maxContentWidth: 1120,
    maxFormWidth: 440,
    maxDetailWidth: 840,
  },
} as const;

export const Colors = {
  light: {
    text: CoffeeTheme.colors.textPrimary,
    background: CoffeeTheme.colors.canvas,
    backgroundElement: CoffeeTheme.colors.surfaceSubtle,
    backgroundSelected: CoffeeTheme.colors.surfaceMuted,
    textSecondary: CoffeeTheme.colors.textSecondary,
  },
  dark: {
    text: '#ffffff',
    background: '#1c1917',
    backgroundElement: '#292524',
    backgroundSelected: '#3c3633',
    textSecondary: '#a8a29e',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    rounded: 'system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1120;
