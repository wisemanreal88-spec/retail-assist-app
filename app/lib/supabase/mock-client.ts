function createQueryBuilder() {
  const builder = {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    order: (column: string, options?: any) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };

  // Make the builder itself awaitable
  return Object.assign(
    async () => ({ data: null, error: null }),
    builder
  ) as any;
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
