import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { glass, gloss, radius as R } from '@/theme/theme';

type Variant = 'light' | 'dark' | 'amber' | 'card';

interface GlassProps extends Omit<ViewProps, 'style'> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: Variant;
  /**
   * Real backdrop blur. On by default for chrome (bars, headers, search). Turn it
   * off for anything repeated in a scrolling list — the fill + rim carry the look
   * without paying for a blur per row.
   */
  blur?: boolean;
  /** Specular sheen across the top edge — the "glossy" in glassy-glossy. */
  sheen?: boolean;
  radius?: number;
}

/**
 * Frosted glass: tint → blur → top sheen → 1px light rim → content.
 * Only the decorative layers are clipped, so the surface can still cast a shadow
 * (iOS drops shadows on `overflow: hidden` views). The rim is what sells it —
 * glass catches light along its edge.
 */
export function Glass({ children, style, variant = 'light', blur = true, sheen = true, radius = R.lg, ...rest }: GlassProps) {
  const v = glass[variant];
  const blurCfg = 'blur' in v ? v : null;

  return (
    <View {...rest} style={[{ borderRadius: radius, backgroundColor: v.fill }, style]}>
      {/* zIndex -1: decorations sit behind content but above the fill. On web, absolute layers
          otherwise paint over static children (e.g. SVG icons) whatever the DOM order. */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.under, { borderRadius: radius, overflow: 'hidden' }]}>
        {/* Radius on the blur itself too: web backdrop-filter ignores the parent's rounded clip. */}
        {blur && blurCfg && <BlurView intensity={blurCfg.blur} tint={blurCfg.tint} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />}
        {sheen && <Sheen soft={variant === 'dark'} />}
      </View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.under, { borderRadius: radius, borderWidth: 1, borderColor: v.rim }]} />
      {children}
    </View>
  );
}

/**
 * Glass used as a background layer behind a control's own content (icon buttons,
 * bars). Sits underneath its siblings on every platform.
 */
export function GlassFill(props: Omit<GlassProps, 'style' | 'children'>) {
  return <Glass {...props} pointerEvents="none" style={[StyleSheet.absoluteFill, styles.under]} />;
}

/** Top-edge specular highlight. Drop it inside any rounded, overflow-hidden surface. */
export function Sheen({ soft = false, height = '55%' }: { soft?: boolean; height?: ViewStyle['height'] }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={soft ? gloss.sheenSoft : gloss.sheen}
      style={[styles.sheen, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1 },
  under: { zIndex: -1 },
});
