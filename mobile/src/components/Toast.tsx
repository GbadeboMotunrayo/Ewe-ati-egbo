import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Info } from 'lucide-react-native';
import { colors, fonts, radius, shadow, spacing } from '@/theme/theme';

type Tone = 'success' | 'info';
interface ToastMsg { id: number; text: string; tone: Tone }
interface ToastApi { show: (text: string, tone?: Tone) => void }

const ToastContext = createContext<ToastApi>({ show: () => {} });

/**
 * Lightweight in-app toast (works on web too, unlike Alert). Slides up from the
 * bottom, stays 2.2s, and is announced to screen readers.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((text: string, tone: Tone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setMsg({ id: Date.now(), text, tone });
    timer.current = setTimeout(() => setMsg(null), 2200);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + 90 }]}>
        {msg && (
          <Animated.View
            key={msg.id}
            entering={FadeInDown.springify().damping(16)}
            exiting={FadeOutDown.duration(180)}
            style={styles.toast}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            {msg.tone === 'success' ? <CheckCircle2 size={18} color={colors.greenTint} /> : <Info size={18} color={colors.amberTint} />}
            <Text style={styles.text}>{msg.text}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: spacing.md },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 480,
    backgroundColor: colors.bark,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 4,
    ...shadow.lg,
  },
  text: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.white, flexShrink: 1 },
});
