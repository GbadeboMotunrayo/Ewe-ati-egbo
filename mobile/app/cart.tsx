import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Trash2 } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { productById, sellerById } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCart } from '@/state/cart';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();

  // Group lines by seller — mirrors the multi-seller split model.
  const groups = new Map<string, { sellerName: string; lines: { id: string; title: string; qty: number; pricePence: number }[] }>();
  for (const line of cart.lines) {
    const p = productById(line.productId);
    if (!p) continue;
    const seller = sellerById(p.sellerId);
    const key = p.sellerId;
    if (!groups.has(key)) groups.set(key, { sellerName: seller?.name ?? 'Seller', lines: [] });
    groups.get(key)!.lines.push({ id: p.id, title: p.title, qty: line.quantity, pricePence: p.pricePence });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>Your basket</Text>
        <Pressable onPress={() => router.back()} style={styles.close}>
          <X size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 160, gap: spacing.md }}>
        {cart.lines.length === 0 && <Text style={styles.empty}>Your basket is empty.</Text>}

        {Array.from(groups.values()).map((g) => (
          <Card key={g.sellerName} style={{ gap: spacing.sm }}>
            <Text style={styles.seller}>{g.sellerName}</Text>
            {g.lines.map((l) => (
              <View key={l.id} style={styles.line}>
                <Text style={styles.lineTitle} numberOfLines={1}>
                  {l.qty} × {l.title}
                </Text>
                <Text style={styles.linePrice}>{gbp(l.pricePence * l.qty)}</Text>
              </View>
            ))}
          </Card>
        ))}

        {cart.lines.length > 0 && (
          <Pressable style={styles.clear} onPress={cart.clear}>
            <Trash2 size={14} color={colors.textSecondary} />
            <Text style={styles.clearText}>Clear basket</Text>
          </Pressable>
        )}
      </ScrollView>

      {cart.lines.length > 0 && (
        <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Row label="Products" value={gbp(cart.productSubtotalPence)} />
          <Row label="Delivery (consolidated)" value={gbp(cart.deliveryPence)} />
          <Row label="Total" value={gbp(cart.totalPence)} bold />
          <Button label="Checkout with Paystack" onPress={() => {}} style={{ marginTop: spacing.sm }} />
          <Text style={styles.note}>Paystack split → seller · cargo agent · platform. (Demo — no charge.)</Text>
        </View>
      )}
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  seller: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.primary },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineTitle: { fontFamily: fonts.body, fontSize: 14, color: colors.text, flex: 1, marginRight: spacing.sm },
  linePrice: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: spacing.sm },
  clearText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  bar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  bold: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
  note: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
