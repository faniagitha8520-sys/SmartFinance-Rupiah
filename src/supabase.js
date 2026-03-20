import { createClient } from "@supabase/supabase-js";

// =====================================================
// 🔥 GANTI INI DENGAN SUPABASE CREDENTIALS LO
// Supabase Dashboard → Settings → API
// =====================================================
const SUPABASE_URL = "https://bvrtunobcfrtzzipgivl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kufk62lRMxPmW9xLTRAPZg_VNNtUbZi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
