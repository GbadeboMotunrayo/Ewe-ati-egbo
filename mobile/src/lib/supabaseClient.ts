import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True once real Supabase env vars are set — screens fall back to mock data until then. */
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('your-project'));

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    'Supabase env vars missing or placeholder — running in demo mode against src/data/mockData.ts. See mobile/.env.example.'
  );
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
