import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { breakpoints, spacing } from '@/theme/theme';

/**
 * The phone tab bar floats over content. Screens add `contentPad` to their scroll
 * padding so the last row is never trapped behind the glass. Desktop uses a sidebar → small pad.
 */
export function useTabBarSpace() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const barHeight = 64;
  const bottomGap = Math.max(insets.bottom, 12);
  const isDesktop = width >= breakpoints.desktop;
  return { barHeight, bottomGap, contentPad: isDesktop ? spacing.xl : barHeight + bottomGap + spacing.lg };
}

/**
 * One source of truth for responsive layout. Screens ask "how much room do I have?"
 * instead of hard-coding widths — like water taking the shape of its glass.
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;

  // Content never stretches into unreadable line lengths on big screens.
  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 900 : width;
  const gutter = isTablet ? spacing.lg : spacing.md;
  const contentWidth = Math.min(width, contentMaxWidth) - gutter * 2;

  // Product grid: aim for ~170–230dp cards, 2 columns minimum.
  const gap = isTablet ? spacing.md : spacing.sm + 4;
  const columns = Math.max(2, Math.min(6, Math.floor((contentWidth + gap) / (isDesktop ? 230 : 170))));
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  // Horizontal rails show ~2.3 cards on phones (the peek invites a swipe).
  const railCardWidth = isTablet ? 200 : Math.round(Math.min(190, (width - gutter * 2) / 2.3));

  return { width, height, isTablet, isDesktop, contentMaxWidth, contentWidth, gutter, gap, columns, cardWidth, railCardWidth };
}
