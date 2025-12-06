export function createClient(): any {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
      }),
      insert: async () => ({ data: null, error: null }),
    }),
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        return { data: null, error: null };
      },
      signInWithOAuth: async (options: any) => {
        return { data: null, error: null };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        return { data: null, error: null };
      },
      signOut: async () => ({ data: null, error: null }),
      resetPasswordForEmail: async (email: string) => ({ data: null, error: null }),
      getSession: async () => ({ data: { session: null } }),
    },
  } as any;
}
