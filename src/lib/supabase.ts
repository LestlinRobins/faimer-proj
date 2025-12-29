import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// Replace these with your actual Supabase project details
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project-url.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for better TypeScript support
export interface Post {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  dislikes: number;
  reply_count: number;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  alert_type: "danger" | "warning" | "info";
  location: string;
  urgency: "high" | "medium" | "low";
  likes: number;
  dislikes: number;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  post_id?: string;
  alert_id?: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id?: string;
  alert_id?: string;
  comment_id?: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
}

// New types for dynamic features
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CropPlan {
  id: string;
  user_id: string;
  crop_name: string;
  crop_type: string;
  area_size?: number;
  area_unit?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  status: string;
  tasks?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityHistory {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description?: string;
  metadata?: any;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  phone?: string;
  language: string;
  location?: string;
  farm_size?: number;
  farm_size_unit?: string;
  main_crops?: string[];
  soil_type?: string;
  irrigation_type?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface UserAlert {
  id: string;
  user_id: string;
  alert_type: string;
  title: string;
  message: string;
  crop?: string;
  severity: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
  expires_at?: string;
}

export interface Labourer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  skills: string[];
  experience_years?: number;
  location: string;
  wage_per_day?: number;
  rating: number;
  total_reviews: number;
  availability: string;
  bio?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FairFarmProduct {
  id: string;
  user_id: string;
  farmer_name: string;
  product_name: string;
  category: string;
  price: number;
  unit: string;
  quantity_available?: number;
  location: string;
  phone: string;
  description?: string;
  organic: boolean;
  in_stock: boolean;
  rating: number;
  reviews: number;
  image_url?: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface FairFarmTransaction {
  id: string;
  product_id: string;
  buyer_user_id: string;
  buyer_name: string;
  seller_user_id: string;
  amount: number;
  status: string;
  blockchain_hash?: string;
  created_at: string;
  completed_at?: string;
}

export interface GovernmentScheme {
  id: string;
  scheme_name: string;
  category: string;
  description?: string;
  eligibility?: string;
  benefits?: string;
  how_to_apply?: string;
  state?: string;
  source?: string;
  last_updated: string;
  created_at: string;
}

export interface AgricultureNews {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  source?: string;
  url?: string;
  image_url?: string;
  published_at?: string;
  created_at: string;
}
