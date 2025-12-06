import { env } from '@/lib/env';

function createQueryBuilder() {
  return {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };
}

export async function createAdminSupabaseClient() {
  if (env.useMockMode) {
    return {
      from: (table: string) => ({
        select: (columns?: string) => createQueryBuilder(),
        insert: (rows: any[]) => createQueryBuilder(),
        upsert: (rows: any, options?: any) => createQueryBuilder(),
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
      insert: (rows: any[]) => createQueryBuilder(),
      upsert: (rows: any, options?: any) => createQueryBuilder(),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  };
}
