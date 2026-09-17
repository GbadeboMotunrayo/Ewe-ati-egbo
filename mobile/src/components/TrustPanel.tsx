import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Minus } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import type { Product } from '@/data/mockData';

// The trust panel (docs/screens.md §C5). Shows ONLY checks that were actually
// performed — no decorative green ticks.
export function TrustPanel({ product }: { product: Product }) {
  const rows: { label: string; ok: boolean; note?: string }[] = [
    { label: 'Seller identity', ok: true, note: 'Verified' },
    { label: 'Product class', ok: true, note: `Class ${product.productClass}` },
    { label: 'Ingredients provided', ok: true },
    { label: 'Claims review', ok: product.claimStatus === 'approved', note: product.claimStatus === 'approved' ? 'Passed' : 'Under review' },
    {
      label: 'Restricted-ingredient check',
      ok: product.ingredientStatus === 'green',
      note: product.ingredientStatus === 'green' ? 'Clear' : product.ingredientStatus,
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Product information checks</Text>
      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <View style={styles.left}>
            {r.ok ? <Check size={16} color={colors.primary} /> : <Minus size={16} color={colors.textSecondary} />}
            <Text style={styles.label}>{r.label}</Text>
          </View>
          <Text style={[styles.note, { color: r.ok ? colors.primary : colors.textSecondary }]}>
            {r.note ?? (r.ok ? '✓' : '—')}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.greenTint,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  heading: { fontFamily: fonts.headingMedium, fontSize: 13, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  note: { fontFamily: fonts.bodyMedium, fontSize: 12 },
});
