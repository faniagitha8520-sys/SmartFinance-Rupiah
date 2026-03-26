import { createClient } from "@supabase/supabase-js";

// Sekarang dia baca otomatis dari file .env lu
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);