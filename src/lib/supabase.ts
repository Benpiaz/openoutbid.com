import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser + server components (RLS disabled, anon can read/write)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client - only use in server/API routes (has service_role)
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return supabase;
  return createClient(supabaseUrl, serviceKey);
}
