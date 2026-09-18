import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { colors, fonts, radius, spacing, productClass as pc } from '@/theme/theme';
import { sellerById, type Product } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { VerificationBadge } from '@/components/VerificationBadge';

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const seller = sellerById(product.sellerId);
  const klass = pc[product.productClass];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.thumb} contentFit="cover" transition={200} accessibilityLabel={`${product.title} — ${product.commonName}`} />
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
          {seller && <VerificationBadge status={seller.verification} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumb: { height: 118, width: '100%', backgroundColor: colors.cream },
  body: { padding: spacing.sm + 2, gap: 2 },
  title: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.text },
  vernacular: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontFamily: fonts.heading, fontSize: 15, color: colors.primary },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  sellerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  seller: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, flexShrink: 1 },
});
