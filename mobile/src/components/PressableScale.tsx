import React from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { motion } from '@/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** How far it sinks when pressed (0.96 = subtle, 0.9 = playful). */
  scaleTo?: number;
  /** Light tap on native; skipped on web. */
  haptic?: boolean;
  children: React.ReactNode;
}

/**
 * The app's basic touch surface: it sinks under your finger on a spring and lifts
 * slightly on mouse hover (web), so every tap feels acknowledged.
 */
export function PressableScale({ style, scaleTo = 0.96, haptic = false, onPressIn, onPressOut, onHoverIn, onHoverOut, onPress, children, ...rest }: Props) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, motion.press);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motion.press);
        onPressOut?.(e);
      }}
      onHoverIn={(e) => {
        lift.value = withSpring(-2, motion.press);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        lift.value = withSpring(0, motion.press);
        onHoverOut?.(e);
      }}
      style={[style, animated, Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
