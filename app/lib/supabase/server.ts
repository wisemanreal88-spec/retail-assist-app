import { cookies } from 'next/headers';

function createQueryBuilder() {
  const builder = {
    eq: (column: string, value: any) => createQueryBuilder(),
    limit: (n: number) => createQueryBuilder(),
    order: (column: string, options?: any) => createQueryBuilder(),
    select: (columns?: string) => createQueryBuilder(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };

  // Make the builder itself awaitable and return a `{ data, error }` shape
  return Object.assign(
    async () => ({ data: null, error: null }),
    builder
  ) as any;
}

export async function createServerSupabaseClient(): Promise<any> {
  return {
    from: (table: string) => ({
      select: (columns?: string) => createQueryBuilder(),
      insert: (rows: any) => createQueryBuilder(),
      upsert: (rows: any, options?: any) => createQueryBuilder(),
    }),
    auth: {
      getSession: async () => {
        try {
          const cookieStore: any = await cookies();
          const demo = cookieStore?.get?.('ra_demo_session');
          if (demo && demo.value) {
            try {
              const parsed = JSON.parse(decodeURIComponent(demo.value));
              if (parsed && parsed.session) return { data: { session: parsed.session } };
              if (parsed && parsed.user) return { data: { session: { user: parsed.user } } };
            } catch (e) {
              // fallthrough
            }
          }
        } catch (e) {
          // ignore cookie read errors on non-next server contexts
        }

        return { data: { session: null } };
      },
    },
  } as any;
}

export async function createAdminSupabaseClient(): Promise<any> {
  return createServerSupabaseClient();
}

export async function createMockAdminSupabaseClient(): Promise<any> {
  return createServerSupabaseClient();
}
