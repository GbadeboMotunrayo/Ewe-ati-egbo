import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Search, X, SearchX } from 'lucide-react-native';
import { colors, fonts, motion, radius, shadow, spacing } from '@/theme/theme';
import { categories, searchProducts } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { useLayout } from '@/hooks/useLayout';

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const L = useLayout();
  const params = useLocalSearchParams<{ category?: string; tradition?: string; q?: string }>();

  const [query, setQuery] = useState(first(params.q) ?? '');
  const [category, setCategory] = useState<string | undefined>(first(params.category));
  const [tradition, setTradition] = useState<string | undefined>(first(params.tradition));

  // Follow new deep links / home-screen taps while this tab stays mounted.
  useEffect(() => setCategory(first(params.category)), [params.category]);
  useEffect(() => setTradition(first(params.tradition)), [params.tradition]);

  // Typing stays instant; filtering runs just behind it.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchProducts({ query: deferredQuery, category, tradition }), [deferredQuery, category, tradition]);
  const filtersActive = Boolean(query || category || tradition);

  const reset = () => {
    setQuery('');
    setCategory(undefined);
    setTradition(undefined);
    router.setParams({ category: undefined, tradition: undefined, q: undefined });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={[styles.inner, { maxWidth: L.contentMaxWidth, paddingHorizontal: L.gutter }]}>
        <Animated.Text entering={FadeInDown.duration(motion.base)} style={styles.h1} accessibilityRole="header">
          Explore
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(60).duration(motion.base)} style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
            placeholder={L.isTablet ? "Try “ewuro”, “bitter leaf” or a botanical name" : "Try “ewuro” or “bitter leaf”"}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search products"
            maxLength={100}
          />
          {query.length > 0 && (
            <Animated.View entering={FadeIn.duration(motion.fast)} exiting={FadeOut.duration(motion.fast)}>
              <PressableScale onPress={() => setQuery('')} style={styles.clearBtn} accessibilityLabel="Clear search" scaleTo={0.85}>
                <X size={16} color={colors.textSecondary} />
              </PressableScale>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chips, { paddingHorizontal: Math.max(L.gutter, (L.width - L.contentMaxWidth) / 2 + L.gutter) }]}
        >
          <Pill label="All" size="md" selected={!category} onPress={() => setCategory(undefined)} />
          {categories.map((c) => (
            <Pill key={c} label={c} size="md" selected={category === c} onPress={() => setCategory(category === c ? undefined : c)} />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.inner, { maxWidth: L.contentMaxWidth, paddingHorizontal: L.gutter }]}>
        <View style={styles.metaRow}>
          <Text style={styles.hint} accessibilityLiveRegion="polite">
            {results.length} {results.length === 1 ? 'result' : 'results'}
            {tradition ? ` · ${tradition}` : ''}
          </Text>
          {filtersActive && (
            <PressableScale onPress={reset} accessibilityLabel="Clear all filters" style={styles.resetBtn}>
              <Text style={styles.resetText}>Clear filters</Text>
            </PressableScale>
          )}
        </View>
      </View>

      <FlatList
        key={`grid-${L.columns}`} // numColumns can't change on the fly
        data={results}
        keyExtractor={(p) => p.id}
        numColumns={L.columns}
        style={{ flex: 1 }}
        columnWrapperStyle={{ gap: L.gap }}
        contentContainerStyle={[styles.list, { gap: L.gap, paddingHorizontal: L.gutter, maxWidth: L.contentMaxWidth, width: '100%', alignSelf: 'center' }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * motion.stagger).duration(motion.base)}
            exiting={FadeOut.duration(motion.fast)}
            layout={LinearTransition.springify().damping(18)}
          >
            <ProductCard product={item} width={L.cardWidth} onPress={() => router.push(`/product/${item.id}`)} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <Animated.View entering={FadeIn.duration(motion.base)} style={styles.empty}>
            <View style={styles.emptyIcon}><SearchX size={28} color={colors.ochre} /></View>
            <Text style={styles.emptyTitle}>No matches{query ? ` for “${query}”` : ''}</Text>
            <Text style={styles.emptyBody}>Try a Yoruba, Igbo or Hausa name, the English name, or clear the filters.</Text>
            {filtersActive && (
              <PressableScale onPress={reset} style={styles.emptyBtn} accessibilityLabel="Clear all filters">
                <Text style={styles.emptyBtnText}>Clear filters</Text>
              </PressableScale>
            )}
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  inner: { width: '100%', alignSelf: 'center' },
  h1: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingLeft: spacing.md, paddingRight: spacing.xs, height: 50, ...shadow.sm,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, height: '100%' },
  clearBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  chips: { gap: spacing.sm, paddingVertical: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  hint: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
  resetBtn: { paddingVertical: 4 },
  resetText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primary },
  list: { paddingBottom: spacing.xl * 2 },
  empty: { alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.amberTint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.text, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 320 },
  emptyBtn: { marginTop: spacing.md, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  emptyBtnText: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.primary },
});
