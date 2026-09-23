import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { colors, fonts, radius, shadow, spacing, productClass as pc } from '@/theme/theme';
import { sellerById, type Product } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  product: Product;
  onPress: () => void;
  /** Width decided by the parent grid/rail — cards never hard-code their size. */
  width: number;
}

export function ProductCard({ product, onPress, width }: Props) {
  const seller = sellerById(product.sellerId);
  const klass = pc[product.productClass];
  const imageH = Math.round(width * 0.72);

  return (
    <PressableScale
      style={[styles.card, { width }]}
      onPress={onPress}
      accessibilityLabel={`${product.title}, ${gbp(product.pricePence)}, rated ${product.rating.toFixed(1)}${seller ? `, sold by ${seller.name}` : ''}`}
      accessibilityHint="Opens product details"
    >
      <View style={{ height: imageH, backgroundColor: colors.cream }}>
        <Image
          source={{ uri: product.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          accessibilityIgnoresInvertColors
        />
        <View style={[styles.classTag, { backgroundColor: klass.tint }]}>
          <Text style={[styles.classText, { color: klass.color }]}>{klass.label}</Text>
        </View>
      </View>
      <View style={styles.body}>
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
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  classTag: { position: 'absolute', top: 8, left: 8, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
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
