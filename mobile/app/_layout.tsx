import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import { misconfigured } from '@/lib/supabaseClient';
import { AuthProvider, useAuth } from '@/state/auth';
import { CartProvider } from '@/state/cart';
import { colors, fonts, spacing } from '@/theme/theme';

export default function RootLayout() {
  // If the font request fails (offline, blocked CDN) we fall back to system fonts
  // instead of rendering a blank screen forever.
  const [loaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!loaded && !fontError) return null;
  if (misconfigured) return <Misconfigured />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <SessionScopedCart>
              <ToastProvider>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
                    animationDuration: 260,
                    gestureEnabled: true,
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
                  <Stack.Screen name="cart" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                </Stack>
              </ToastProvider>
            </SessionScopedCart>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** A fresh basket per signed-in user: signing out (or switching account) empties it. */
function SessionScopedCart({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return <CartProvider key={session?.user.id ?? 'guest'}>{children}</CartProvider>;
}

function Misconfigured() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Ewe ati Egbo is temporarily unavailable</Text>
      <Text style={styles.body}>We're doing some maintenance. Please try again shortly.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, textAlign: 'center' },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
