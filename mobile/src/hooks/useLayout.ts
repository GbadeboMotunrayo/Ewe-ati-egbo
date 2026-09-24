import { useWindowDimensions } from 'react-native';
import { breakpoints, spacing } from '@/theme/theme';

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
