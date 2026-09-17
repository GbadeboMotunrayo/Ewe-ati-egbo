import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { categories, products, traditions } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Pill } from '@/components/Pill';
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

      <Section title="Shop by category">
        <View style={styles.chips}>
          {categories.map((c) => (
            <Pill key={c} label={c} tint={colors.cream} color={colors.bark} />
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
});
