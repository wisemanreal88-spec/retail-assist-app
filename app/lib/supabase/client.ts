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
      auth: {
        signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
        signUp: async (credentials: any) => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
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
    auth: {
      signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
      signUp: async (credentials: any) => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}
