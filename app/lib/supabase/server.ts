export async function createServerSupabaseClient() {
  const { env } = require('../env');
  
  if (env.useMockMode) {
    // Return mock client for development
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

  // TODO: Implement real Supabase server client
  // For now, return mock client
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
