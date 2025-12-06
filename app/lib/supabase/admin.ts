import { env } from '@/lib/env';

export async function createAdminSupabaseClient() {
  // This client would normally use the SUPABASE_SERVICE_ROLE_KEY server-side
  if (env.useMockMode) {
    // return mock admin client (similar to mock-client)
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
      auth: {
        getSession: async () => ({ data: { session: null } }),
      },
    };
  }

  // TODO: Implement real Supabase admin client using SUPABASE_SERVICE_ROLE_KEY
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
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  };
}
