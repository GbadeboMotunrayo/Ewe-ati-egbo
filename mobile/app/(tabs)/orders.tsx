import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Circle } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { orders } from '@/data/mockData';
import { Card } from '@/components/Card';
import { gbp } from '@/lib/format';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}>
      <Text style={styles.h1}>Your orders</Text>
      {orders.map((o) => (
        <Card key={o.id} style={styles.card}>
          <View style={styles.head}>
            <View>
              <Text style={styles.ref}>{o.ref}</Text>
              <Text style={styles.sub}>
                {o.productTitle} · {o.sellerName}
              </Text>
            </View>
            <Text style={styles.total}>{gbp(o.totalPence)}</Text>
          </View>
          <Text style={styles.corridor}>{o.corridorLabel}</Text>

          <View style={styles.timeline}>
            {o.legs.map((leg, i) => (
              <View key={leg.status} style={styles.leg}>
                <View style={styles.legIcon}>
                  <View style={[styles.dot, leg.done && styles.dotDone]}>
                    {leg.done ? <Check size={12} color={colors.white} /> : <Circle size={8} color={colors.textSecondary} />}
                  </View>
                  {i < o.legs.length - 1 && <View style={[styles.legLine, leg.done && styles.legLineDone]} />}
                </View>
                <Text style={[styles.legLabel, leg.done && styles.legLabelDone]}>{leg.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  h1: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ref: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  total: { fontFamily: fonts.heading, fontSize: 16, color: colors.primary },
  corridor: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ochre },
  timeline: { marginTop: spacing.sm, gap: 2 },
  leg: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  legIcon: { width: 22, alignItems: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.primary },
  legLine: { width: 2, height: 20, backgroundColor: colors.border, marginTop: 2 },
  legLineDone: { backgroundColor: colors.primary },
  legLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, paddingBottom: spacing.sm },
  legLabelDone: { color: colors.text, fontFamily: fonts.bodyMedium },
});
