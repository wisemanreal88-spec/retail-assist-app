function createQueryBuilder() {
  return {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    order: (column: string, options?: any) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };
}

export async function createServerSupabaseClient() {
  const { env } = require('../env');
  
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

  // TODO: Implement real Supabase server client
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

export async function createAdminSupabaseClient() {
  return createServerSupabaseClient();
}

export async function createMockAdminSupabaseClient() {
  return createServerSupabaseClient();
}
