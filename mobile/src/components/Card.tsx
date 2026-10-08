import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadow, spacing } from '@/theme/theme';
import { Glass } from '@/components/Glass';

/**
 * Frosted card over the botanical backdrop. No backdrop blur by default — cards
 * repeat in lists, and the dense milky fill + light rim read as glass on their own.
 * Pass `blur` for a lone hero card where the real frost is worth the cost.
 */
export function Card({ children, style, blur = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; blur?: boolean }) {
  return (
    <Glass variant={blur ? 'light' : 'card'} blur={blur} radius={radius.lg} style={[{ padding: spacing.md }, shadow.sm, style]}>
      {children}
    </Glass>
  );
}
