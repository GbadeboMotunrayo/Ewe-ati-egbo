import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Plane, Truck } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { corridorById, type Product } from '@/data/mockData';
import { gbp, eta } from '@/lib/format';

// Delivery quote shown BEFORE add-to-basket (docs/screens.md §C5) — never surprise
// the customer with cost or ETA after they've committed.
export function DeliveryQuote({ product }: { product: Product }) {
  const isDirect = product.fulfilment === 'uk_direct';
  const corridor = corridorById(product.corridorId);

  const carrier = isDirect ? 'UK direct (Evri/Royal Mail)' : corridor?.label ?? 'Cross-border';
  const price = isDirect ? 399 : corridor?.pricePence ?? 0;
  const window = isDirect ? '2–4 days' : corridor ? eta(corridor.transitMinDays, corridor.transitMaxDays) : '—';

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>{isDirect ? <Truck size={18} color={colors.ochre} /> : <Plane size={18} color={colors.ochre} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{carrier}</Text>
        <Text style={styles.sub}>
          {window} · {gbp(price)} delivery
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.amberTint,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  route: { fontFamily: fonts.headingMedium, fontSize: 13, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
