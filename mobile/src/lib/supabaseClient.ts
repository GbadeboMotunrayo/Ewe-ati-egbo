import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { sessionStorageAdapter } from '@/lib/secureStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True once real Supabase env vars are set — screens fall back to mock data until then. */
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('your-project'));

/**
 * Demo mode must be a deliberate choice. A production build that is simply MISSING its
 * keys should fail loudly, not quietly ship fake orders and a pretend checkout.
 * Set EXPO_PUBLIC_DEMO=1 for showcase builds (e.g. the GitHub Pages demo).
 */
export const isDemoAllowed = __DEV__ || process.env.EXPO_PUBLIC_DEMO === '1';
export const misconfigured = !isSupabaseConfigured && !isDemoAllowed;

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    'Supabase env vars missing or placeholder — running in demo mode against src/data/mockData.ts. See mobile/.env.example.'
  );
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder', {
  auth: {
    storage: sessionStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // PKCE: magic-link/OAuth callbacks carry a one-time code, not the tokens themselves,
    // so another app claiming the eweatiegbo:// scheme can't steal a session.
    flowType: 'pkce',
    detectSessionInUrl: Platform.OS === 'web',
  },
});
