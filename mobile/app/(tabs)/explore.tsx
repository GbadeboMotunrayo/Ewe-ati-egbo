import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { searchProducts } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = searchProducts(query);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Try “ewuro”, “bitter leaf” or a botanical name"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <Text style={styles.hint}>
        Multilingual search — vernacular, common and botanical names all match.
      </Text>

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />}
        ListEmptyComponent={<Text style={styles.empty}>No products match “{query}”.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm },
  list: { paddingBottom: spacing.xl, gap: spacing.md },
  row: { justifyContent: 'space-between' },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: spacing.xl, textAlign: 'center' },
});
