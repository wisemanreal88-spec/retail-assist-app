export async function createServerSupabaseClient() {
  // TODO: Implement Supabase server client
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        single: async () => ({ data: null, error: null }),
      }),
      upsert: () => ({
        select: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };
}

export async function createAdminSupabaseClient() {
  return createServerSupabaseClient();
}

export async function createMockAdminSupabaseClient() {
  return createServerSupabaseClient();
}
