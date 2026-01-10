
export enum StoreType {
  PLAY_STORE = 'PLAY_STORE',
  APP_STORE = 'APP_STORE',
  UNKNOWN = 'UNKNOWN'
}

export interface Screenshot {
  id: string;
  url: string;
  // Added optional metadata for processed assets
  device?: 'phone' | 'tablet';
  width?: number;
  height?: number;
  optimized?: boolean;
  optimizedUrl?: string;
  storagePath?: string;
}

export interface AppData {
  id: string;
  name: string;
  developer: string;
  icon: string;
  rating: number;
  reviews: number; // Added missing property
  category: string;
  store: StoreType;
  screenshots: Screenshot[];
  description: string;
  scrapedAt: string; // Added missing property
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[]; // Renamed/Added to match usage in components
  competitorComparison: { name: string; score: number }[]; // Added missing property
}

export type ViewState = 'landing' | 'loading' | 'results';

// Added missing view type used in Landing component
export type AppView = 'home' | 'dashboard' | 'history' | 'settings' | 'pricing';

// Added missing UserProfile type
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  tier: 'free' | 'pro' | 'enterprise';
  memberSince: string;
  credits: {
    used: number;
    total: number;
  };
}

// Added missing PricingPlan type
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  limit: string;
  features: string[];
  recommended?: boolean;
}
