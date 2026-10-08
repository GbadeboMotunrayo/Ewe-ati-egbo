import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { aurora } from '@/theme/theme';

/**
 * Ambient botanical light behind every screen. Glass needs something to refract —
 * on a flat page frosted surfaces just look grey. Radial-gradient orbs give soft,
 * blur-free glow (cheap), and each drifts slowly on the UI thread via a CSS keyframe
 * animation. Reduced motion → the orbs stay put.
 */
const ORBS: Array<{ color: string; size: number; opacity: number; pos: ViewStyle; drift: [number, number]; seconds: number }> = [
  { color: aurora.leaf, size: 560, opacity: 0.55, pos: { top: -180, left: -160 }, drift: [60, 40], seconds: 26 },
  { color: aurora.ochre, size: 480, opacity: 0.38, pos: { top: 220, right: -200 }, drift: [-50, 60], seconds: 31 },
  { color: aurora.sun, size: 520, opacity: 0.5, pos: { bottom: -160, left: -120 }, drift: [70, -40], seconds: 29 },
  { color: aurora.forest, size: 420, opacity: 0.16, pos: { bottom: 120, right: -120 }, drift: [-40, -50], seconds: 35 },
];

/** One soft, blur-free light pool. Reused for local glows (e.g. on the hero). */
export function Orb({ color, size, opacity, id, style }: { color: string; size: number; opacity: number; id: string; style?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function Backdrop() {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: aurora.base, overflow: 'hidden' }]}>
      {ORBS.map((o, i) => (
        <Animated.View
          key={i}
          style={[
            { position: 'absolute', width: o.size, height: o.size },
            o.pos,
            reduced
              ? null
              : {
                  animationName: {
                    from: { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] },
                    to: { transform: [{ translateX: o.drift[0] }, { translateY: o.drift[1] }, { scale: 1.08 }] },
                  },
                  animationDuration: `${o.seconds}s`,
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                  animationTimingFunction: 'ease-in-out',
                },
          ]}
        >
          <Svg width={o.size} height={o.size}>
            <Defs>
              <RadialGradient id={`orb${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={o.color} stopOpacity={o.opacity} />
                <Stop offset="0.55" stopColor={o.color} stopOpacity={o.opacity * 0.35} />
                <Stop offset="1" stopColor={o.color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={o.size / 2} cy={o.size / 2} r={o.size / 2} fill={`url(#orb${i})`} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}
