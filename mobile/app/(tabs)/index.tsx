import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  Extrapolation,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Search, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { colors, fonts, motion, radius, shadow, spacing } from '@/theme/theme';
import { IMAGES, products, traditions, type Product } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { useCart } from '@/state/cart';
import { useAuth } from '@/state/auth';
import { useLayout } from '@/hooks/useLayout';

// Tiles map to real catalogue categories so each one opens a filtered list.
const CATEGORY_TILES = [
  { label: 'Herbs', category: 'Herbs', image: IMAGES.herbs },
  { label: 'Botanicals', category: 'Botanicals', image: IMAGES.turmericTea },
  { label: 'Supplements', category: 'Supplements', image: IMAGES.smoothie },
  { label: 'Beauty', category: 'Natural beauty', image: IMAGES.plant },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { demoMode } = useAuth();
  const L = useLayout();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  // The compact bar only accepts touches once it's actually visible.
  const [compactVisible, setCompactVisible] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > 120,
    (visible, prev) => {
      if (visible !== prev) runOnJS(setCompactVisible)(visible);
    }
  );

  // Compact bar fades/slides in once the big hero has scrolled away.
  const compactBar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [90, 150], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [90, 150], [-12, 0], Extrapolation.CLAMP) }],
  }));
  // Hero drifts slower than the page (gentle parallax) and softens as it leaves.
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-100, 0, 200], [-30, 0, 60], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, 180], [1, 0.4], Extrapolation.CLAMP),
  }));

  const trending = products;
  const newest = [...products].reverse();
  const inner = { width: '100%' as const, maxWidth: L.contentMaxWidth, alignSelf: 'center' as const };

  return (
    <View style={styles.screen}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
          <Animated.View style={[inner, { paddingHorizontal: L.gutter }, heroStyle]}>
            <View style={styles.heroTop}>
              <Animated.View entering={FadeInDown.duration(motion.slow)}>
                <Text style={[styles.brand, L.isTablet && { fontSize: 30 }]} accessibilityRole="header">
                  Ewe ati Egbo
                </Text>
                <Text style={styles.tagline}>Leaves and roots, moved with trust</Text>
              </Animated.View>
              <CartButton />
            </View>
            <Animated.View entering={FadeInDown.delay(80).duration(motion.slow)}>
              <PressableScale
                style={styles.search}
                scaleTo={0.98}
                onPress={() => router.push('/explore')}
                accessibilityRole="search"
                accessibilityLabel="Search herbs, botanicals and products"
              >
                <Search size={18} color={colors.textSecondary} />
                <Text style={styles.searchText}>Search herbs, botanicals, products…</Text>
              </PressableScale>
            </Animated.View>
          </Animated.View>
        </LinearGradient>

        <View style={inner}>
          {demoMode && (
            <Animated.View entering={FadeInDown.delay(120)} style={[styles.demo, { marginHorizontal: L.gutter }]}>
              <Text style={styles.demoText}>Demo mode — showing sample data. Nothing you do here is charged or saved.</Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(140).duration(motion.slow)} style={{ paddingHorizontal: L.gutter, marginTop: spacing.md }}>
            <PressableScale
              style={[styles.banner, { height: L.isTablet ? 220 : 160 }]}
              scaleTo={0.985}
              onPress={() => router.push('/explore')}
              accessibilityLabel="Shop now — authentic botanicals from verified sellers"
            >
              <Image source={{ uri: IMAGES.produce }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityIgnoresInvertColors />
              <LinearGradient colors={['rgba(9,40,30,0.92)', 'rgba(9,40,30,0.25)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <View style={styles.bannerInner}>
                <Text style={[styles.bannerTitle, L.isTablet && { fontSize: 30, lineHeight: 36 }]}>Nature's Goodness,{'\n'}Naturally</Text>
                <Text style={styles.bannerSub}>Authentic botanicals from verified sellers</Text>
                <View style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>Shop now</Text>
                  <ArrowRight size={14} color={colors.primaryDark} />
                </View>
              </View>
            </PressableScale>
          </Animated.View>

          <Section title="Shop by category" delay={200} gutter={L.gutter}>
            <View style={[styles.tiles, { paddingHorizontal: L.gutter, gap: L.gap }]}>
              {CATEGORY_TILES.map((c, i) => (
                <Animated.View key={c.label} entering={FadeInDown.delay(220 + i * motion.stagger)} style={{ flex: 1 }}>
                  <PressableScale
                    style={styles.tile}
                    onPress={() => router.push({ pathname: '/explore', params: { category: c.category } })}
                    accessibilityLabel={`Shop ${c.label}`}
                  >
                    <Image source={{ uri: c.image }} style={[styles.tileImg, { height: L.isTablet ? 110 : 68 }]} contentFit="cover" transition={300} />
                    <Text style={styles.tileLabel} numberOfLines={1}>{c.label}</Text>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </Section>

          <Section title="Shop by tradition" delay={260} gutter={L.gutter}>
            <View style={[styles.chips, { paddingHorizontal: L.gutter }]}>
              {traditions.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  size="md"
                  tint={colors.amberTint}
                  color={colors.ochre}
                  onPress={() => router.push({ pathname: '/explore', params: { tradition: t } })}
                />
              ))}
            </View>
          </Section>

          <Section title="Trending botanicals" delay={320} gutter={L.gutter} onSeeAll={() => router.push('/explore')}>
            <ProductRail items={trending} />
          </Section>

          <Section title="New from our sellers" delay={380} gutter={L.gutter} onSeeAll={() => router.push('/explore')}>
            <ProductRail items={newest} />
          </Section>
        </View>
      </Animated.ScrollView>

      {/* Compact header that appears after scrolling */}
      <Animated.View pointerEvents={compactVisible ? 'box-none' : 'none'} style={[styles.compact, { paddingTop: insets.top + 6 }, compactBar]}>
        <View style={[inner, styles.compactInner, { paddingHorizontal: L.gutter }]}>
          <Text style={styles.compactBrand}>Ewe ati Egbo</Text>
          <View style={styles.compactActions}>
            <PressableScale onPress={() => router.push('/explore')} style={styles.iconBtnLight} accessibilityLabel="Search">
              <Search size={18} color={colors.primary} />
            </PressableScale>
            <CartButton light />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/** Phone: swipeable rail with snap + peek. Tablet/desktop: a tidy grid. */
function ProductRail({ items }: { items: Product[] }) {
  const router = useRouter();
  const L = useLayout();

  if (L.isTablet) {
    return (
      <View style={[styles.grid, { paddingHorizontal: L.gutter, gap: L.gap }]}>
        {items.slice(0, L.columns).map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(i * motion.stagger)}>
            <ProductCard product={p} width={L.cardWidth} onPress={() => router.push(`/product/${p.id}`)} />
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(p) => p.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: L.gutter, gap: L.gap }}
      snapToInterval={L.railCardWidth + L.gap}
      decelerationRate="fast"
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * motion.stagger)}>
          <ProductCard product={item} width={L.railCardWidth} onPress={() => router.push(`/product/${item.id}`)} />
        </Animated.View>
      )}
    />
  );
}

/** Cart icon with a badge that pops whenever the count changes. */
function CartButton({ light }: { light?: boolean }) {
  const router = useRouter();
  const { count } = useCart();
  const pop = useSharedValue(1);

  useEffect(() => {
    if (count > 0) pop.value = withSequence(withSpring(1.35, motion.pop), withSpring(1, motion.pop));
  }, [count, pop]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <PressableScale
      style={light ? styles.iconBtnLight : styles.cartBtn}
      onPress={() => router.push('/cart')}
      accessibilityLabel={count > 0 ? `Basket, ${count} ${count === 1 ? 'item' : 'items'}` : 'Basket, empty'}
    >
      <ShoppingBag size={20} color={light ? colors.primary : colors.white} />
      {count > 0 && (
        <Animated.View style={[styles.cartBadge, badgeStyle]}>
          <Text style={styles.cartBadgeText}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      )}
    </PressableScale>
  );
}

function Section({
  title,
  children,
  delay = 0,
  gutter,
  onSeeAll,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
  gutter: number;
  onSeeAll?: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(motion.slow)} style={styles.section}>
      <View style={[styles.sectionHead, { paddingHorizontal: gutter }]}>
        <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
        {onSeeAll && (
          <PressableScale onPress={onSeeAll} accessibilityLabel={`See all ${title}`} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </PressableScale>
        )}
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { paddingBottom: spacing.lg, borderBottomLeftRadius: radius.lg + 4, borderBottomRightRadius: radius.lg + 4, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontFamily: fonts.heading, fontSize: 24, color: colors.white },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.greenTint, marginTop: 2 },
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  iconBtnLight: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  cartBadge: {
    position: 'absolute', top: -3, right: -3, backgroundColor: colors.ochre, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: colors.white,
  },
  cartBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.white },
  search: {
    marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, ...shadow.md,
  },
  searchText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  demo: { backgroundColor: colors.amberTint, marginTop: spacing.md, borderRadius: radius.md, padding: spacing.sm + 2 },
  demoText: { fontFamily: fonts.body, fontSize: 12, color: colors.ochre },
  section: { marginTop: spacing.lg, gap: spacing.sm + 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  seeAll: { paddingVertical: 6, paddingHorizontal: 4 },
  seeAllText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  banner: { borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'center', ...shadow.md },
  bannerInner: { padding: spacing.md + 4 },
  bannerTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.white, lineHeight: 27 },
  bannerSub: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 6, maxWidth: 220 },
  bannerBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white,
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9, marginTop: 12,
  },
  bannerBtnText: { fontFamily: fonts.headingMedium, fontSize: 12, color: colors.primaryDark },
  tiles: { flexDirection: 'row' },
  tile: { alignItems: 'center' },
  tileImg: { width: '100%', borderRadius: radius.md, backgroundColor: colors.cream },
  tileLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text, marginTop: 6 },
  compact: {
    position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.97)',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, ...shadow.sm,
  },
  compactInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compactBrand: { fontFamily: fonts.heading, fontSize: 17, color: colors.primary },
  compactActions: { flexDirection: 'row', gap: spacing.sm },
});
