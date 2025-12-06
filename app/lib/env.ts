/**
 * Centralized environment variable configuration
 * Ensures consistent access to env vars across the app
 * Supports both mock mode (local dev) and live mode (production)
 */

export const env = {
  // Supabase (client-side)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Mock mode flag (true for local dev, false for production)
  useMockMode: process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE === 'true',

  // OpenAI (server-side only)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Meta/Facebook (server-side only)
  meta: {
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
    verifyToken: process.env.META_VERIFY_TOKEN || '',
  },

  // Test/Debug mode
  isTestMode: process.env.NEXT_PUBLIC_TEST_MODE === 'true',

  // App environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Validate that required env vars are set
 * Call this in critical API routes
 */
export function validateEnv(required: string[]): boolean {
  return required.every((key) => {
    if (!process.env[key]) {
      console.warn(`Missing required environment variable: ${key}`);
      return false;
    }
    return true;
  });
}
