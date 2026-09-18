import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { IMAGES, products, traditions } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Pill } from '@/components/Pill';

const CATEGORY_TILES = [
  { name: 'Herbs', image: IMAGES.herbs },
  { name: 'Teas', image: IMAGES.turmericTea },
  { name: 'Supplements', image: IMAGES.smoothie },
  { name: 'Beauty', image: IMAGES.plant },
];
import { useCart } from '@/state/cart';
import { useAuth } from '@/state/auth';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { demoMode } = useAuth();

  const trending = products;
  const newSellers = [...products].reverse();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.brand}>Ewe ati Egbo</Text>
            <Text style={styles.tagline}>Leaves and roots, moved with trust</Text>
          </View>
          <Pressable style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <ShoppingBag size={20} color={colors.white} />
            {cart.count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.count}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <Pressable style={styles.search} onPress={() => router.push('/explore')}>
          <Text style={styles.searchText}>Search herbs, botanicals, products…</Text>
        </Pressable>
      </LinearGradient>

      {demoMode && (
        <View style={styles.demo}>
          <Text style={styles.demoText}>Demo mode — showing sample data. Add Supabase keys to go live.</Text>
        </View>
      )}

      <View style={styles.pad}>
        <View style={styles.banner}>
          <Image source={{ uri: IMAGES.produce }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Fresh botanicals" />
          <LinearGradient colors={['rgba(9,40,30,0.92)', 'rgba(9,40,30,0.35)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={styles.bannerInner}>
            <Text style={styles.bannerTitle}>Nature's Goodness,{'\n'}Naturally</Text>
            <Text style={styles.bannerSub}>Authentic botanicals from verified sellers</Text>
            <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Shop Now</Text></View>
          </View>
        </View>
      </View>

      <Section title="Shop by category">
        <View style={styles.tiles}>
          {CATEGORY_TILES.map((c) => (
            <Pressable key={c.name} style={styles.tile} onPress={() => router.push('/explore')}>
              <Image source={{ uri: c.image }} style={styles.tileImg} contentFit="cover" />
              <Text style={styles.tileLabel}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Shop by tradition">
        <View style={styles.chips}>
          {traditions.map((t) => (
            <Pill key={t} label={t} tint={colors.amberTint} color={colors.ochre} />
          ))}
        </View>
      </Section>

      <Section title="Trending botanicals">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} onPress={() => router.push(`/product/${p.id}`)} />
          ))}
        </ScrollView>
      </Section>

      <Section title="New from our sellers">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {newSellers.map((p) => (
            <ProductCard key={p.id} product={p} onPress={() => router.push(`/product/${p.id}`)} />
          ))}
        </ScrollView>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontFamily: fonts.heading, fontSize: 24, color: colors.white },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.greenTint, marginTop: 2 },
  cartBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.ochre, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.white },
  search: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.md },
  searchText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  demo: { backgroundColor: colors.amberTint, marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: radius.md, padding: spacing.sm + 2 },
  demoText: { fontFamily: fonts.body, fontSize: 12, color: colors.ochre },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.text, paddingHorizontal: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md },
  rail: { gap: spacing.sm, paddingHorizontal: spacing.md },
  pad: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  banner: { height: 150, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'center' },
  bannerInner: { padding: spacing.md },
  bannerTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.white, lineHeight: 26 },
  bannerSub: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 6, maxWidth: 180 },
  bannerBtn: { alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12 },
  bannerBtnText: { fontFamily: fonts.headingMedium, fontSize: 12, color: colors.primaryDark },
  tiles: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md },
  tile: { flex: 1, alignItems: 'center' },
  tileImg: { width: '100%', height: 62, borderRadius: radius.md, backgroundColor: colors.cream },
  tileLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.text, marginTop: 6 },
});
