// FIXED: provide a browser-safe Supabase helper (createBrowserSupabaseClient) for Client Components
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client factory for Client Components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Use this in Client Components only.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return supabaseCreateClient(url, anonKey);
}

// Backwards-compatible alias used elsewhere in repo
export const createClient = createBrowserSupabaseClient;
export default createBrowserSupabaseClient;
