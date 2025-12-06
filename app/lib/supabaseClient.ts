export default async function getSupabaseClient() {
  // TODO: Implement Supabase client getter
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  };
}
