import { env } from '@/lib/env';

export async function createAdminSupabaseClient() {
  if (env.useMockMode) {
    return {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
          }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: async (rows: any[]) => ({ data: rows, error: null }),
        upsert: (rows: any[], options?: any) => ({
          select: async (columns?: string) => ({ data: rows, error: null }),
        }),
      }),
      auth: {
        getSession: async () => ({ data: { session: null } }),
      },
    };
  }

  // TODO: Implement real Supabase admin client using SUPABASE_SERVICE_ROLE_KEY
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: async (rows: any[]) => ({ data: rows, error: null }),
      upsert: (rows: any[], options?: any) => ({
        select: async (columns?: string) => ({ data: rows, error: null }),
      }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  };
}
