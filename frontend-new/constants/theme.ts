// VTO App Design System v1.0 - Apple/Doji Inspired Minimalism

export const Colors = {
  // Primary colors (Design System v1.0)
  background: '#FFFFFF',        // Primary Background: White
  text: {
    primary: '#000000',         // Primary Text: Black
    secondary: '#6E6E73',       // Secondary Text: Neutral Gray (Apple system gray)
    caption: '#6E6E73'          // Caption text
  },
  
  // Interactive accent (minimal use)
  accent: '#007AFF',            // Deep Blue (iOS system blue)
  
  // Borders and dividers
  border: '#E5E5EA',            // Light Gray
  
  // Status colors
  success: '#34C759',           // Soft Green
  warning: '#FF9500',           // Amber
  error: '#FF3B30',             // Red
  
  // Legacy support (deprecated - use above)
  primary: '#007AFF',
  white: '#FFFFFF',
  black: '#000000'
};

export const Typography = {
  // Inter typeface (closest open source to SF Pro)
  fontFamily: 'Inter',
  
  fontSize: {
    h1: 30,                     // 28-32px - Page titles
    h2: 23,                     // 22-24px - Section headers  
    body: 17,                   // 16-17px - Default text
    caption: 13                 // 13px - Metadata, tags
  },
  
  fontWeight: {
    regular: '400' as const,    // Regular (400)
    medium: '500' as const,     // Medium (500) 
    semibold: '600' as const    // SemiBold (600)
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  }
};

export const Spacing = {
  // 8pt base grid system
  xs: 4,
  sm: 8,                        // Element gaps: 8-16px
  md: 16,                       // Element gaps: 8-16px
  lg: 24,                       // Section margins: 24-32px
  xl: 32,                       // Section margins: 24-32px
  xxl: 48,
  
  // Component specific
  buttonPadding: 16,            // CTA padding: 12-16px
  inputPadding: 16,             // Input padding: 16px
  cardPadding: 20
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,                       // Card radius: 16-20px (rounded 2xl)
  xxl: 20,                      // Card radius: 16-20px (rounded 2xl)
  full: 9999
};

export const Shadows = {
  // Soft, diffuse shadows
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,        // 0 4px 12px rgba(0,0,0,0.05)
    shadowRadius: 12,
    elevation: 2
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1
  }
};

export const Animation = {
  // iOS style spring animations
  duration: {
    fast: 200,                  // 200-400ms
    normal: 300,
    slow: 400
  },
  
  easing: {
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // iOS style spring
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};

export const Layout = {
  // Content constraints
  maxContentWidth: 960,         // Max 960px for desktop
  minTouchTarget: 44,           // Minimum 44px tap targets
  
  // Safe areas and margins
  screenPadding: 20,
  sectionMargin: 32
};