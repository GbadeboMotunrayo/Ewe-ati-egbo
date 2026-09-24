import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

interface AuthState {
  session: Session | null;
  loading: boolean;
  /** Demo mode = Supabase isn't configured; screens show mock data. */
  demoMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Single source of truth: supabase-js v2 emits INITIAL_SESSION first, then every
    // change in order — so an older getSession() result can never overwrite a newer one.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    // Safety net: never spin forever if storage/network fails.
    const timeout = setTimeout(() => setLoading(false), 8000);

    // Refresh tokens only while the app is in the foreground (Supabase RN guidance).
    const appState =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (s) => {
            if (s === 'active') void supabase.auth.startAutoRefresh();
            else void supabase.auth.stopAutoRefresh();
          });

    return () => {
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
      appState?.remove();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      demoMode: !isSupabaseConfigured,
      signOut: async () => {
        try {
          if (isSupabaseConfigured) await supabase.auth.signOut();
        } finally {
          setSession(null);
        }
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
