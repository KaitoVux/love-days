import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validate that we have our required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase URL or key is missing. Make sure you have .env.local with required variables."
  );
}

// Function to safely access environment variables
export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
    return "";
  }
  return value;
};

export default supabase;
