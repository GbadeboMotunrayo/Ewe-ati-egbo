import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Plane, Truck, TriangleAlert } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { quoteDelivery, type Product } from '@/data/mockData';
import { gbp } from '@/lib/format';

// Delivery quote shown BEFORE add-to-basket (docs/screens.md §C5) — never surprise
// the customer with cost or ETA after they've committed. If a route can't be
// priced we say so plainly instead of showing "£0.00 delivery".
export function DeliveryQuote({ product }: { product: Product }) {
  const q = quoteDelivery(product);

  if (!q) {
    return (
      <View style={[styles.wrap, styles.warn]} accessibilityRole="alert">
        <View style={styles.iconWrap}><TriangleAlert size={18} color={colors.red} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.route}>Delivery quote unavailable</Text>
          <Text style={styles.sub}>This seller's shipping route isn't set up yet, so it can't be ordered right now.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`Delivery: ${q.label}, ${q.window}, ${gbp(q.pricePence)}`}>
      <View style={styles.iconWrap}>{q.direct ? <Truck size={18} color={colors.ochre} /> : <Plane size={18} color={colors.ochre} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{q.label}</Text>
        <Text style={styles.sub}>
          {q.window} · {gbp(q.pricePence)} delivery
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.amberTint, borderRadius: radius.md, padding: spacing.sm + 2 },
  warn: { backgroundColor: colors.redTint },
  iconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  route: { fontFamily: fonts.headingMedium, fontSize: 13, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
