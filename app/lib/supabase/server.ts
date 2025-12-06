export async function createServerSupabaseClient(): Promise<any> {
  const { env } = require('../env');
  
  // Return a flexible mock/stub that accepts any Supabase query
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  } as any;
}

export async function createAdminSupabaseClient(): Promise<any> {
  return createServerSupabaseClient();
}

export async function createMockAdminSupabaseClient(): Promise<any> {
  return createServerSupabaseClient();
}
