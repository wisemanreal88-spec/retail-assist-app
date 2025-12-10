import { cookies } from 'next/headers';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Server-side Supabase client with user session authentication
 * Uses cookies to maintain session across requests
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  const supabase = supabaseCreateClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  // Get session from auth header or cookies
  const token = cookieStore.get('sb-auth-token')?.value;
  
  if (token) {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (user) {
      return supabase;
    }
  }

  return supabase;
}

/**
 * Admin Supabase client for server-side operations
 * Uses service_role key to bypass RLS policies
 * Use only for admin operations, never expose to client
 */
export async function createAdminSupabaseClient() {
  if (!env.supabase.serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set - admin operations may fail');
  }

  const supabase = supabaseCreateClient(
    env.supabase.url,
    env.supabase.serviceRoleKey || env.supabase.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return supabase;
}

/**
 * Mock admin client for testing/development
 * When NEXT_PUBLIC_USE_MOCK_SUPABASE=true, use this instead
 */
function createQueryBuilder() {
  const builder = {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    order: (column: string, options?: any) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };

  return Object.assign(
    async () => ({ data: null, error: null }),
    builder
  ) as any;
}

export async function createMockAdminSupabaseClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => createQueryBuilder(),
      insert: (rows: any) => createQueryBuilder(),
      upsert: (rows: any, options?: any) => createQueryBuilder(),
      update: (data: any) => createQueryBuilder(),
      delete: () => createQueryBuilder(),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async (token: string) => ({ data: { user: null }, error: null }),
    },
  } as any;
}

/**
 * Insert a new system log entry
 * @param payload - The log message and optional details
 */
export async function insertSystemLog(payload: {
  message: string;
  level?: 'info' | 'warning' | 'error' | 'debug';
  source?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = await createAdminSupabaseClient();
    const { error } = await supabase.from('system_logs').insert({
      message: payload.message,
      level: payload.level || 'info',
      source: payload.source || 'system',
      metadata: payload.metadata,
    });

    if (error) {
      console.error('Failed to insert system log:', error.message);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Exception during system log insertion:', message);
  }
}
