// FIXED: ensure createServerSupabaseClient export matches server-only pattern required by server components
import { cookies } from 'next/headers';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client factory for server components & API routes.
 * Uses the service role key and forwards the sb-access-token from cookies as Authorization header.
 *
 * NOTE: This file is server-only and must not be imported by client components.
 */
export const createServerSupabaseClient = () => {
  return supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: cookies().get('sb-access-token')?.value || '',
        },
      },
    }
  );
};
