import { env } from '@/lib/env';

let realClient: any = null;
if (!env.useMockMode && typeof window !== 'undefined') {
  // Only import @supabase/supabase-js in browser and production mode
  // @ts-ignore
  const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');
  realClient = supabaseCreateClient(env.supabase.url, env.supabase.anonKey);
}

function readSession() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('ra_demo_supabase_session') : null;
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeSession(session: any) {
  try {
    if (typeof window !== 'undefined') localStorage.setItem('ra_demo_supabase_session', JSON.stringify(session));
    try {
      if (typeof document !== 'undefined') {
        const cookieVal = encodeURIComponent(JSON.stringify(session));
        document.cookie = `ra_demo_session=${cookieVal}; Path=/; Max-Age=${60 * 60}; SameSite=Lax`;
      }
    } catch (e) {
      // ignore cookie write failures
    }
  } catch (e) {
    // ignore
  }
}

function clearSession() {
  try {
    if (typeof window !== 'undefined') localStorage.removeItem('ra_demo_supabase_session');
  } catch (e) {
    // ignore
  }
}

// Demo credential for the public demo site
const DEMO_EMAIL = 'demo@demo.local';
const DEMO_PASSWORD = 'Demo1234!';

export function createClient(): any {
  if (!env.useMockMode && realClient) {
    return realClient;
  }

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
      // Simulate password sign-in and persist session to localStorage
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          const user = { id: 'demo_user', email: DEMO_EMAIL, user_metadata: { name: 'Demo User' } };
          const session = { user, access_token: 'demo_token', expires_at: Date.now() + 1000 * 60 * 60 };
          writeSession({ session, user });
          return { data: { user, session }, error: null };
        }

        return { data: null, error: { message: 'Invalid demo credentials' } };
      },

      // Simulate OAuth by creating a demo session as well
      signInWithOAuth: async (options: any) => {
        const user = { id: 'demo_oauth_user', email: DEMO_EMAIL, user_metadata: { name: 'Demo User' } };
        const session = { user, access_token: 'demo_oauth_token', expires_at: Date.now() + 1000 * 60 * 60 };
        writeSession({ session, user });
        return { data: { user, session }, error: null };
      },

      signUp: async ({ email, password }: { email: string; password: string }) => {
        // For demo, accept signups but only persist for the session
        const user = { id: `user_${Date.now()}`, email, user_metadata: { name: email.split('@')[0] } };
        const session = { user, access_token: 'demo_signup_token', expires_at: Date.now() + 1000 * 60 * 60 };
        writeSession({ session, user });
        return { data: { user, session }, error: null };
      },

      signOut: async () => {
        clearSession();
        try {
          if (typeof document !== 'undefined') {
            document.cookie = 'ra_demo_session=; Path=/; Max-Age=0; SameSite=Lax';
          }
        } catch (e) {
          // ignore
        }
        return { data: null, error: null };
      },

      resetPasswordForEmail: async (email: string) => ({ data: null, error: null }),

      // Return the persisted demo session if present
      getSession: async () => {
        const raw = readSession();
        if (raw && raw.session) return { data: { session: raw.session } };
        return { data: { session: null } };
      },
    },
  } as any;
}
