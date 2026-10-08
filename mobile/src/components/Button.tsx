import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, glass, gloss, radius, shadow, spacing } from '@/theme/theme';
import { PressableScale } from '@/components/PressableScale';
import { Sheen } from '@/components/Glass';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Primary = glossy: a lit green gradient + a specular sheen across the top, like light
 * on a wet leaf. Secondary = frosted glass with a green rim. Ghost = text only.
 */
export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, accessibilityHint, style }: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic={isPrimary}
      scaleTo={0.97}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === 'ghost' && styles.ghost,
        inactive && styles.disabled,
        style,
      ]}
    >
      {(isPrimary || isSecondary) && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, { zIndex: -1 }]}>
          {isPrimary ? (
            <LinearGradient colors={gloss.green} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          ) : (
            <BlurView intensity={glass.light.blur} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <Sheen height="50%" />
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text
            style={[styles.label, isPrimary && styles.labelPrimary, isSecondary && styles.labelSecondary, variant === 'ghost' && styles.labelGhost]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  clip: { borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    ...shadow.md,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.35,
  },
  secondary: { backgroundColor: glass.light.fill, borderWidth: 1.5, borderColor: 'rgba(31,107,59,0.55)', ...shadow.sm },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { fontFamily: fonts.headingMedium, fontSize: 16 },
  labelPrimary: { color: colors.white, textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  labelSecondary: { color: colors.primaryDark },
  labelGhost: { color: colors.textSecondary },
});
