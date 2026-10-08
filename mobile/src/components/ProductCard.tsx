import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { colors, fonts, glass, radius, shadow, spacing, productClass as pc } from '@/theme/theme';
import { sellerById, type Product } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PressableScale } from '@/components/PressableScale';
import { Sheen } from '@/components/Glass';

interface Props {
  product: Product;
  onPress: () => void;
  /** Width decided by the parent grid/rail — cards never hard-code their size. */
  width: number;
}

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export function ProductCard({ product, onPress, width }: Props) {
  const seller = sellerById(product.sellerId);
  const klass = pc[product.productClass];
  const imageH = Math.round(width * 0.72);
  const reduced = useReducedMotion();

  // The photo leans in a touch under a finger (or mouse) — feedback, on the UI thread.
  const zoom = useSharedValue(1);
  const photo = useAnimatedStyle(() => ({ transform: [{ scale: zoom.get() }] }));
  const lean = (to: number) => {
    if (!reduced) zoom.set(withTiming(to, { duration: 220, easing: EASE_OUT }));
  };

  return (
    <PressableScale
      style={[styles.card, { width }]}
      onPress={onPress}
      onPressIn={() => lean(1.05)}
      onPressOut={() => lean(1)}
      onHoverIn={() => lean(1.06)}
      onHoverOut={() => lean(1)}
      accessibilityLabel={`${product.title}, ${gbp(product.pricePence)}, rated ${product.rating.toFixed(1)}${seller ? `, sold by ${seller.name}` : ''}`}
      accessibilityHint="Opens product details"
    >
      <View style={styles.clip}>
        <View style={{ height: imageH, backgroundColor: colors.cream, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, photo]}>
            <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} accessibilityIgnoresInvertColors />
          </Animated.View>
          <View style={styles.classTag}>
            <Text style={[styles.classText, { color: klass.color }]}>{klass.label}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Sheen soft height="70%" />
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.vernacular} numberOfLines={1}>
            {product.vernacular.slice(0, 2).join(' · ')} · {product.botanicalName}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.price}>{gbp(product.pricePence)}</Text>
            <View style={styles.rating}>
              <Star size={12} color={colors.ochre} fill={colors.ochre} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.sellerRow}>
            <Text style={styles.seller} numberOfLines={1}>
              {seller?.name}
            </Text>
            {seller && <VerificationBadge status={seller.verification} compact />}
          </View>
        </View>
      </View>
      <View pointerEvents="none" style={styles.rim} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  // No overflow:hidden here, so the shadow survives on iOS; the inner `clip` rounds the photo.
  card: { backgroundColor: glass.card.fill, borderRadius: radius.lg, ...shadow.md },
  clip: { borderRadius: radius.lg, overflow: 'hidden' },
  rim: { ...StyleSheet.absoluteFillObject, borderRadius: radius.lg, borderWidth: 1, borderColor: glass.card.rim },
  classTag: {
    position: 'absolute', top: 8, left: 8, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)',
  },
  classText: { fontFamily: fonts.bodyMedium, fontSize: 10 },
  body: { padding: spacing.sm + 2, gap: 2 },
  title: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.text },
  vernacular: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontFamily: fonts.heading, fontSize: 15, color: colors.primary },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  sellerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, gap: 4 },
  seller: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, flexShrink: 1 },
});
