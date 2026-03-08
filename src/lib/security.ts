import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cc_auth_token';
const REFRESH_KEY = 'cc_refresh_token';

export const SecureStorage = {
  async setTokens(access: string, refresh: string) {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(key);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count += 1;
  return true;
}

export function validateEnv() {
  const required = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_API_BASE_URL',
  ];

  const missing = required.filter(
    (key) => !process.env[key] || process.env[key] === '',
  );

  if (missing.length > 0) {
    console.error(`[Security] Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

export function maskSensitive(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return '****';
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
