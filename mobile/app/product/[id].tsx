import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ArrowLeft, Star, Flag, ShoppingBag, PackageSearch } from 'lucide-react-native';
import { colors, fonts, motion, radius, shadow, spacing, productClass as pc } from '@/theme/theme';
import { productById, quoteDelivery, sellerById } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { TrustPanel } from '@/components/TrustPanel';
import { DeliveryQuote } from '@/components/DeliveryQuote';
import { VerificationBadge } from '@/components/VerificationBadge';
import { QuantityStepper } from '@/components/QuantityStepper';
import { PressableScale } from '@/components/PressableScale';
import { useToast } from '@/components/Toast';
import { MAX_QTY_PER_LINE, useCart } from '@/state/cart';
import { useLayout } from '@/hooks/useLayout';

/** Back that always goes somewhere — even after a deep link or a web refresh. */
function useSafeBack() {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace('/'));
}

export default function ProductScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const goBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const toast = useToast();
  const L = useLayout();
  const [qty, setQty] = useState(1);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroH = L.isTablet ? 0 : Math.min(340, Math.round(L.width * 0.8));
  // Parallax: the photo moves at half speed and zooms when you pull down.
  const heroImg = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-heroH, 0, heroH], [-heroH / 2, 0, heroH * 0.5], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-heroH, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));
  const header = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [heroH - 120, heroH - 60], [0, 1], Extrapolation.CLAMP),
  }));

  const product = id ? productById(id) : undefined;
  if (!product) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={styles.missingIcon}><PackageSearch size={30} color={colors.ochre} /></View>
        <Text style={styles.missingTitle}>We couldn't find that product</Text>
        <Text style={styles.missingBody}>It may have been removed, or the link is incomplete.</Text>
        <Button label="Browse products" onPress={() => router.replace('/explore')} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
        <Button label="Go back" variant="ghost" onPress={goBack} />
      </View>
    );
  }

  const seller = sellerById(product.sellerId);
  const klass = pc[product.productClass];
  const deliverable = Boolean(quoteDelivery(product));
  const inCart = cart.quantityOf(product.id);

  const addToBasket = () => {
    if (cart.add(product.id, qty)) {
      toast.show(`Added ${qty} × ${product.title}`);
      setQty(1);
    } else {
      toast.show('This product can’t be ordered right now', 'info');
    }
  };

  const buyBox = (
      <View style={styles.buyBox}>
        <QuantityStepper
          value={qty}
          label={product.title}
          allowRemove={false}
          max={Math.max(1, MAX_QTY_PER_LINE - inCart)}
          onIncrement={() => setQty((q) => Math.min(MAX_QTY_PER_LINE - inCart, q + 1))}
          onDecrement={() => setQty((q) => Math.max(1, q - 1))}
        />
        <Button
          label={!deliverable ? 'Unavailable' : inCart ? `Add ${qty} more · ${inCart} in basket` : `Add ${qty} to basket`}
          onPress={addToBasket}
          disabled={!deliverable || inCart >= MAX_QTY_PER_LINE}
          icon={<ShoppingBag size={18} color={colors.white} />}
          style={{ flex: 1 }}
        />
      </View>
  );

  const details = (
    <View style={[styles.body, L.isTablet && { paddingTop: 0 }]}>
      <Animated.View entering={FadeInDown.duration(motion.base)} style={styles.pillRow}>
        <Pill label={klass.label} color={klass.color} tint={klass.tint} />
        <Pill label={product.tradition} color={colors.ochre} tint={colors.amberTint} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(motion.base)} style={{ gap: 2 }}>
        <Text style={[styles.title, L.isTablet && { fontSize: 28, lineHeight: 34 }]} accessibilityRole="header">{product.title}</Text>
        <Text style={styles.botanical}>{product.botanicalName}</Text>
        <Text style={styles.vernacular}>{product.vernacular.join(' · ')}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(motion.base)} style={styles.priceRow}>
        <Text style={styles.price}>{gbp(product.pricePence)}</Text>
        <Text style={styles.qty}>· {product.netQuantity}</Text>
        <View style={styles.rating} accessible accessibilityLabel={`Rated ${product.rating.toFixed(1)} from ${product.reviewCount} reviews`}>
          <Star size={14} color={colors.ochre} fill={colors.ochre} />
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)} ({product.reviewCount})
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(motion.base)} style={styles.sellerRow}>
        <Text style={styles.soldBy}>Sold by {seller?.name ?? 'an unknown seller'}</Text>
        {seller && <VerificationBadge status={seller.verification} />}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(motion.base)}>
        <DeliveryQuote product={product} />
      </Animated.View>

      {L.isTablet && buyBox}

      <Block title="About this botanical">
        <Text style={styles.p}>{product.description}</Text>
        <Text style={styles.kv}>Origin: {product.origin} · Form: {product.form}</Text>
      </Block>

      <TrustPanel product={product} seller={seller} />

      <Block title="How to use">
        <Text style={styles.p}>{product.directions}</Text>
      </Block>

      <Block title="Safety & storage">
        <Text style={styles.p}>{product.storage}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{product.warnings}</Text>
      </Block>

      <PressableScale
        style={styles.report}
        onPress={() => toast.show('Product reporting goes live at launch — not sent yet', 'info')}
        accessibilityLabel="Report this product to our compliance team"
      >
        <Flag size={14} color={colors.textSecondary} />
        <Text style={styles.reportText}>Report product</Text>
      </PressableScale>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: L.isTablet ? spacing.xl * 2 : 140 }}>
        {L.isTablet ? (
          // Tablet/desktop: photo left (sticky-feeling), details right.
          <View style={[styles.wide, { maxWidth: L.contentMaxWidth, paddingHorizontal: L.gutter, paddingTop: insets.top + 72 }]}>
            <Animated.View entering={FadeInDown.duration(motion.slow)} style={styles.wideMedia}>
              <Image source={{ uri: product.image }} style={styles.wideImg} contentFit="cover" transition={300} accessibilityLabel={`${product.title} — ${product.botanicalName}`} />
            </Animated.View>
            <View style={{ flex: 1 }}>{details}</View>
          </View>
        ) : (
          <>
            <View style={[styles.hero, { height: heroH }]}>
              <Animated.View style={[StyleSheet.absoluteFill, heroImg]}>
                <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} accessibilityLabel={`${product.title} — ${product.botanicalName}`} />
              </Animated.View>
            </View>
            <View style={styles.sheet}>{details}</View>
          </>
        )}
      </Animated.ScrollView>

      {/* Header: solid bar with title fades in once the hero scrolls away (always solid on wide screens). */}
      <Animated.View style={[styles.headerBg, { height: insets.top + 60 }, L.isTablet ? null : header]} pointerEvents="none">
        <Text style={[styles.headerTitle, { marginTop: insets.top }]} numberOfLines={1}>{product.title}</Text>
      </Animated.View>
      <PressableScale
        style={[styles.back, { top: insets.top + 10, left: L.isTablet ? Math.max(L.gutter, (L.width - L.contentMaxWidth) / 2 + L.gutter) : spacing.md }]}
        onPress={goBack}
        accessibilityLabel="Go back"
        scaleTo={0.88}
      >
        <ArrowLeft size={22} color={colors.text} />
      </PressableScale>

      {!L.isTablet && (
        <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
          {buyBox}
        </View>
      )}
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle} accessibilityRole="header">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background, maxWidth: 420, width: '100%', alignSelf: 'center' },
  missingIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.amberTint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  missingTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, textAlign: 'center' },
  missingBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  hero: { backgroundColor: colors.cream, overflow: 'hidden' },
  sheet: { marginTop: -radius.lg, backgroundColor: colors.background, borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4 },
  wide: { flexDirection: 'row', gap: spacing.xl, width: '100%', alignSelf: 'center' },
  wideMedia: { flex: 1, maxWidth: 520 },
  wideImg: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.cream },
  headerBg: {
    position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.97)', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 64, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, ...shadow.sm,
  },
  headerTitle: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
  back: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...shadow.md },
  body: { padding: spacing.md, paddingTop: spacing.lg, gap: spacing.md },
  pillRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  title: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28, color: colors.text },
  botanical: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, fontStyle: 'italic' },
  vernacular: { fontFamily: fonts.body, fontSize: 13, color: colors.ochre },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  price: { fontFamily: fonts.heading, fontSize: 24, color: colors.primary },
  qty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  ratingText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  sellerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  soldBy: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  block: { gap: spacing.xs },
  blockTitle: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
  p: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 21 },
  kv: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  report: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  reportText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  buyBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2, ...shadow.lg,
  },
});
