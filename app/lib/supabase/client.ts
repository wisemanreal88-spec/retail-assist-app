export function createClient() {
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
        }),
      }),
    };
  }

  // TODO: Implement real Supabase client
  // For now, return mock client
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };
}
