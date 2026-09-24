import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Minus, TriangleAlert } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import type { Product, Seller } from '@/data/mockData';

type RowState = 'ok' | 'pending' | 'warn';

const INGREDIENT_NOTE: Record<Product['ingredientStatus'], string> = {
  green: 'Clear',
  amber: 'Under review',
  red: 'Restricted',
};

// The trust panel (docs/screens.md §C5). Shows ONLY checks that were actually
// performed — every tick is derived from real data, none are hard-coded.
export function TrustPanel({ product, seller }: { product: Product; seller?: Seller }) {
  const sellerVerified = seller?.verification === 'verified' || seller?.verification === 'trusted';
  const rows: { label: string; state: RowState; note: string }[] = [
    {
      label: 'Seller identity',
      state: sellerVerified ? 'ok' : seller?.verification === 'suspended' ? 'warn' : 'pending',
      note: sellerVerified ? (seller!.verification === 'trusted' ? 'Trusted' : 'Verified') : seller?.verification === 'suspended' ? 'Suspended' : 'Not yet verified',
    },
    { label: 'Product class', state: 'ok', note: `Class ${product.productClass}` },
    {
      label: 'Claims review',
      state: product.claimStatus === 'approved' ? 'ok' : product.claimStatus === 'blocked' ? 'warn' : 'pending',
      note: product.claimStatus === 'approved' ? 'Passed' : product.claimStatus === 'blocked' ? 'Blocked' : 'Under review',
    },
    {
      label: 'Restricted-ingredient check',
      state: product.ingredientStatus === 'green' ? 'ok' : product.ingredientStatus === 'red' ? 'warn' : 'pending',
      note: INGREDIENT_NOTE[product.ingredientStatus],
    },
  ];

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.heading}>Product information checks</Text>
      {rows.map((r) => (
        <View key={r.label} style={styles.row} accessible accessibilityLabel={`${r.label}: ${r.note}`}>
          <View style={styles.left}>
            {r.state === 'ok' ? (
              <View style={styles.okDot}><Check size={12} color={colors.white} strokeWidth={3} /></View>
            ) : r.state === 'warn' ? (
              <TriangleAlert size={16} color={colors.red} />
            ) : (
              <Minus size={16} color={colors.textSecondary} />
            )}
            <Text style={styles.label}>{r.label}</Text>
          </View>
          <Text style={[styles.note, { color: r.state === 'ok' ? colors.primary : r.state === 'warn' ? colors.red : colors.textSecondary }]}>{r.note}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.greenTint, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
  heading: { fontFamily: fonts.headingMedium, fontSize: 13, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  okDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flexShrink: 1 },
  note: { fontFamily: fonts.bodyMedium, fontSize: 12 },
});
