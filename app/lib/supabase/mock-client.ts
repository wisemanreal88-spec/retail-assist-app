function createQueryBuilder() {
  return {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };
}

export async function createMockAdminSupabaseClient() {
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
