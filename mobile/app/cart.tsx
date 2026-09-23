import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { X, Trash2, ShoppingBag, TriangleAlert, Lock } from 'lucide-react-native';
import { colors, fonts, motion, radius, shadow, spacing } from '@/theme/theme';
import { sellerById, type Product } from '@/data/mockData';
import { gbp } from '@/lib/format';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { QuantityStepper } from '@/components/QuantityStepper';
import { PressableScale } from '@/components/PressableScale';
import { useToast } from '@/components/Toast';
import { MAX_QTY_PER_LINE, useCart, type ResolvedLine } from '@/state/cart';
import { useAuth } from '@/state/auth';
import { useLayout } from '@/hooks/useLayout';

const spring = LinearTransition.springify().damping(18);

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const toast = useToast();
  const { demoMode } = useAuth();
  const L = useLayout();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Group by seller — mirrors the multi-seller split model. Keyed by sellerId (unique).
  const groups = new Map<string, { sellerName: string; items: ResolvedLine[] }>();
  for (const item of cart.items) {
    const key = item.product.sellerId;
    if (!groups.has(key)) groups.set(key, { sellerName: sellerById(key)?.name ?? 'Seller', items: [] });
    groups.get(key)!.items.push(item);
  }

  const empty = cart.items.length === 0;
  const blocked = cart.undeliverable.length > 0;

  const checkout = () => {
    if (demoMode) toast.show('Demo mode — no payment taken', 'info');
    else toast.show('Checkout opens at launch', 'info');
  };

  const summary = (
    <View style={styles.summary}>
      <Row label="Products" value={gbp(cart.productSubtotalPence)} />
      <Row label="Delivery (consolidated)" value={gbp(cart.deliveryPence)} />
      <View style={styles.divider} />
      <Row label="Total" value={gbp(cart.totalPence)} bold />
      {blocked && (
        <View style={styles.warn} accessibilityRole="alert">
          <TriangleAlert size={14} color={colors.red} />
          <Text style={styles.warnText}>Remove items without a delivery route to continue.</Text>
        </View>
      )}
      <Button
        label={demoMode ? 'Checkout with Paystack (demo)' : 'Checkout with Paystack'}
        onPress={checkout}
        disabled={blocked}
        icon={<Lock size={16} color={colors.white} />}
        style={{ marginTop: spacing.sm }}
        accessibilityHint={demoMode ? 'Demo only — no payment is taken' : undefined}
      />
      <Text style={styles.note}>Prices are confirmed securely on our server before you pay.</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[styles.headerInner, { maxWidth: L.contentMaxWidth, paddingHorizontal: L.gutter }]}>
          <View>
            <Text style={styles.title} accessibilityRole="header">Your basket</Text>
            {!empty && <Text style={styles.count}>{cart.count} {cart.count === 1 ? 'item' : 'items'}</Text>}
          </View>
          <PressableScale onPress={close} style={styles.close} accessibilityLabel="Close basket" scaleTo={0.88}>
            <X size={22} color={colors.text} />
          </PressableScale>
        </View>
      </View>

      {empty ? (
        <Animated.View entering={FadeIn.duration(motion.base)} style={styles.emptyWrap}>
          <View style={styles.emptyIcon}><ShoppingBag size={30} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptyBody}>Find herbs, roots and botanicals from verified sellers.</Text>
          <Button label="Start exploring" onPress={() => { close(); router.push('/explore'); }} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
        </Animated.View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingHorizontal: L.gutter, maxWidth: L.contentMaxWidth, paddingBottom: L.isTablet ? spacing.xl : 260 },
              L.isTablet && styles.contentWide,
            ]}
          >
            <View style={{ flex: 1, gap: spacing.md }}>
              {Array.from(groups.entries()).map(([sellerId, g], gi) => (
                <Animated.View key={sellerId} entering={FadeInDown.delay(gi * motion.stagger)} layout={spring}>
                  <Card style={{ gap: spacing.md }}>
                    <Text style={styles.seller}>{g.sellerName}</Text>
                    {g.items.map((it) => (
                      <CartLineRow key={it.product.id} item={it} undeliverable={cart.undeliverable.includes(it.product)} />
                    ))}
                  </Card>
                </Animated.View>
              ))}

              <Animated.View layout={spring}>
                <PressableScale style={styles.clear} onPress={cart.clear} accessibilityLabel="Clear basket">
                  <Trash2 size={14} color={colors.textSecondary} />
                  <Text style={styles.clearText}>Clear basket</Text>
                </PressableScale>
              </Animated.View>
            </View>

            {L.isTablet && <Card style={styles.sideSummary}>{summary}</Card>}
          </ScrollView>

          {!L.isTablet && (
            <Animated.View entering={FadeInDown.duration(motion.base)} style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
              {summary}
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

function CartLineRow({ item, undeliverable }: { item: ResolvedLine; undeliverable: boolean }) {
  const cart = useCart();
  const p: Product = item.product;
  return (
    <Animated.View layout={spring} exiting={FadeOutLeft.duration(motion.fast)} style={styles.line}>
      <Image source={{ uri: p.image }} style={styles.thumb} contentFit="cover" transition={200} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.lineTitle} numberOfLines={2}>{p.title}</Text>
        <Text style={styles.unit}>{gbp(p.pricePence)} · {p.netQuantity}</Text>
        {undeliverable && <Text style={styles.lineWarn}>No delivery route yet</Text>}
        <View style={styles.lineBottom}>
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={MAX_QTY_PER_LINE}
            label={p.title}
            onIncrement={() => cart.increment(p.id)}
            onDecrement={() => cart.decrement(p.id)}
          />
          <Animated.Text key={item.linePence} entering={FadeIn.duration(motion.fast)} style={styles.linePrice}>
            {gbp(item.linePence)}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: spacing.sm, backgroundColor: colors.background },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', alignSelf: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  count: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, ...shadow.sm },
  content: { paddingTop: spacing.md, gap: spacing.lg, width: '100%', alignSelf: 'center' },
  contentWide: { flexDirection: 'row', alignItems: 'flex-start' },
  sideSummary: { width: 340 },
  seller: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.primary },
  line: { flexDirection: 'row', gap: spacing.md },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.cream },
  lineTitle: { fontFamily: fonts.headingMedium, fontSize: 14, color: colors.text },
  unit: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  lineWarn: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.red },
  lineBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  linePrice: { fontFamily: fonts.heading, fontSize: 15, color: colors.text },
  clear: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  clearText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  summary: { gap: 6 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 },
  warn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.redTint, borderRadius: radius.sm, padding: spacing.sm },
  warnText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.red, flexShrink: 1 },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingTop: spacing.md, ...shadow.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  bold: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  note: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, maxWidth: 420, width: '100%', alignSelf: 'center' },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  emptyBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
