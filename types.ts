export enum StoreType {
  PLAY_STORE = 'PLAY_STORE',
  APP_STORE = 'APP_STORE',
  UNKNOWN = 'UNKNOWN'
}

export interface Screenshot {
  id: string;
  url: string;
  device: string;
  width: number;
  height: number;
  storagePath?: string; // Path in R2 bucket
  optimized?: boolean;  // Whether it has been processed by Sharp
  optimizedUrl?: string; // Public R2 URL
}

export interface AppData {
  id: string;
  name: string;
  developer: string;
  icon: string;
  rating: number;
  reviews: number;
  category: string;
  store: StoreType;
  screenshots: Screenshot[];
  description: string;
  scrapedAt: string;
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  competitorComparison: {
    name: string;
    score: number;
  }[];
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: SubscriptionTier;
  credits: {
    used: number;
    total: number;
  };
  memberSince: string;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: string;
  features: string[];
  limit: string;
  recommended?: boolean;
}