import { env } from '@/lib/env';

function createQueryBuilder() {
  return {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };
}

export async function createAdminSupabaseClient() {
  if (env.useMockMode) {
    return {
      from: (table: string) => ({
        select: (columns?: string) => createQueryBuilder(),
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

  // TODO: Implement real Supabase admin client
  return {
    from: (table: string) => ({
      select: (columns?: string) => createQueryBuilder(),
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
