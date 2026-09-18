import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Flag } from 'lucide-react-native';
import { colors, fonts, radius, spacing, productClass as pc } from '@/theme/theme';
import { productById, sellerById } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { TrustPanel } from '@/components/TrustPanel';
import { DeliveryQuote } from '@/components/DeliveryQuote';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useCart } from '@/state/cart';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();

  const product = productById(String(id));
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.missing}>Product not found.</Text>
      </View>
    );
  }
  const seller = sellerById(product.sellerId);
  const klass = pc[product.productClass];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessibilityLabel={`${product.title} — ${product.botanicalName}`} />
          <Pressable style={[styles.back, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.pillRow}>
            <Pill label={klass.label} color={klass.color} tint={klass.tint} />
            <Pill label={product.tradition} color={colors.ochre} tint={colors.amberTint} />
          </View>

          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.botanical}>{product.botanicalName}</Text>
          <Text style={styles.vernacular}>{product.vernacular.join(' · ')}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{gbp(product.pricePence)}</Text>
            <Text style={styles.qty}>· {product.netQuantity}</Text>
            <View style={styles.rating}>
              <Star size={14} color={colors.ochre} fill={colors.ochre} />
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviewCount})
              </Text>
            </View>
          </View>

          <View style={styles.sellerRow}>
            <Text style={styles.soldBy}>Sold by {seller?.name}</Text>
            {seller && <VerificationBadge status={seller.verification} />}
          </View>

          <DeliveryQuote product={product} />

          <Block title="About this botanical">
            <Text style={styles.p}>{product.description}</Text>
            <Text style={styles.kv}>Origin: {product.origin} · Form: {product.form}</Text>
          </Block>

          <TrustPanel product={product} />

          <Block title="How to use">
            <Text style={styles.p}>{product.directions}</Text>
          </Block>

          <Block title="Safety & storage">
            <Text style={styles.p}>{product.storage}</Text>
            <Text style={[styles.p, { color: colors.textSecondary }]}>{product.warnings}</Text>
          </Block>

          <Pressable style={styles.report}>
            <Flag size={14} color={colors.textSecondary} />
            <Text style={styles.reportText}>Report product</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View>
          <Text style={styles.barPrice}>{gbp(product.pricePence)}</Text>
          <Text style={styles.barQty}>{product.netQuantity}</Text>
        </View>
        <Button
          label={cart.lines.some((l) => l.productId === product.id) ? 'Added ✓  Add another' : 'Add to basket'}
          onPress={() => cart.add(product.id)}
          style={{ flex: 1, marginLeft: spacing.md }}
        />
      </View>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missing: { fontFamily: fonts.body, color: colors.textSecondary },
  hero: { height: 260, backgroundColor: colors.cream },
  back: { position: 'absolute', left: spacing.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  body: { padding: spacing.md, gap: spacing.md },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  botanical: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, fontStyle: 'italic', marginTop: -8 },
  vernacular: { fontFamily: fonts.body, fontSize: 13, color: colors.ochre, marginTop: -8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  price: { fontFamily: fonts.heading, fontSize: 22, color: colors.primary },
  qty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  ratingText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  sellerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  soldBy: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  block: { gap: spacing.xs },
  blockTitle: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
  p: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 20 },
  kv: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  report: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: spacing.md },
  reportText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.md, paddingTop: spacing.sm,
  },
  barPrice: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  barQty: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
