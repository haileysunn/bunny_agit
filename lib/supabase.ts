import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SmokingArea = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  has_ashtray: boolean;
  has_roof: boolean;
  verification_count: number;
  is_verified: boolean;
  created_at: string;
  reporter_id?: string;
};

export type Review = {
  id: string;
  area_id: string;
  user_id: string;
  cleanliness: number;
  is_available: boolean;
  comment: string;
  created_at: string;
};

export type User = {
  id: string;
  nickname: string;
  points: number;
  rank: string;
  created_at: string;
};
