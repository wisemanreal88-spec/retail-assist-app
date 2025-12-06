export function createClient() {
  const { env } = require('../env');
  
  if (env.useMockMode) {
    return {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
          }),
        }),
        insert: async (rows: any[]) => ({ data: rows, error: null }),
      }),
    };
  }

  // TODO: Implement real Supabase client
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
      }),
      insert: async (rows: any[]) => ({ data: rows, error: null }),
    }),
  };
}
