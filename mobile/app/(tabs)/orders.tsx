import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { Check, Package } from 'lucide-react-native';
import { colors, fonts, motion, radius, spacing } from '@/theme/theme';
import { orders, type Order } from '@/data/mockData';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { gbp } from '@/lib/format';
import { useAuth } from '@/state/auth';
import { useLayout } from '@/hooks/useLayout';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { demoMode } = useAuth();
  const L = useLayout();

  // Real users never see the sample orders — only demo builds do.
  // TODO(live): load the signed-in user's orders from the API.
  const list: Order[] = demoMode ? orders : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl * 2 }}>
      <View style={{ width: '100%', maxWidth: L.isDesktop ? 820 : L.contentMaxWidth, alignSelf: 'center', paddingHorizontal: L.gutter }}>
        <Animated.Text entering={FadeInDown.duration(motion.base)} style={styles.h1} accessibilityRole="header">
          Your orders
        </Animated.Text>
        {demoMode && <Text style={styles.demo}>Sample orders (demo mode)</Text>}

        {list.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(80)} style={styles.empty}>
            <View style={styles.emptyIcon}><Package size={28} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyBody}>When you order, you'll track every leg here — from the origin hub to your door.</Text>
            <Button label="Start shopping" onPress={() => router.push('/explore')} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
          </Animated.View>
        ) : (
          list.map((o, i) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(80 + i * 70).duration(motion.slow)}>
              <OrderCard order={o} index={i} />
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function OrderCard({ order: o, index }: { order: Order; index: number }) {
  const doneCount = o.legs.filter((l) => l.done).length;
  const progress = o.legs.length > 1 ? (doneCount - 1) / (o.legs.length - 1) : 1;
  const delivered = o.legs[o.legs.length - 1]?.done;

  // The progress line "draws" itself when the card appears.
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withDelay(300 + index * 120, withTiming(Math.max(0, progress), { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [fill, progress, index]);
  const lineStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ref}>{o.ref}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {o.productTitle} · {o.sellerName}
          </Text>
        </View>
        <Text style={styles.total}>{gbp(o.totalPence)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.corridor}>{o.corridorLabel}</Text>
        <View style={[styles.status, { backgroundColor: delivered ? colors.greenTint : colors.amberTint }]}>
          <Text style={[styles.statusText, { color: delivered ? colors.primary : colors.ochre }]}>{delivered ? 'Delivered' : 'On its way'}</Text>
        </View>
      </View>

      <View style={styles.timeline} accessible accessibilityLabel={`Tracking: ${o.legs.map((l) => `${l.label} ${l.done ? 'done' : 'pending'}`).join(', ')}`}>
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, lineStyle]} />
        </View>
        {o.legs.map((leg) => (
          <View key={leg.status} style={styles.leg}>
            <View style={[styles.dot, leg.done && styles.dotDone]}>{leg.done && <Check size={12} color={colors.white} strokeWidth={3} />}</View>
            <Text style={[styles.legLabel, leg.done && styles.legLabelDone]}>{leg.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const DOT = 22;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  h1: { fontFamily: fonts.heading, fontSize: 24, color: colors.text },
  demo: { fontFamily: fonts.body, fontSize: 12, color: colors.ochre, marginTop: 2 },
  card: { marginTop: spacing.md, gap: spacing.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  ref: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  total: { fontFamily: fonts.heading, fontSize: 16, color: colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  corridor: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ochre },
  status: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontFamily: fonts.bodyMedium, fontSize: 11 },
  timeline: { marginTop: spacing.sm, gap: 14, position: 'relative' },
  track: { position: 'absolute', left: DOT / 2 - 1, top: DOT / 2, bottom: DOT / 2, width: 2, backgroundColor: colors.border, borderRadius: 1, overflow: 'hidden' },
  trackFill: { width: 2, backgroundColor: colors.primary },
  leg: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  legLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  legLabelDone: { color: colors.text, fontFamily: fonts.bodyMedium },
  empty: { alignItems: 'center', marginTop: spacing.xl * 1.5, maxWidth: 380, alignSelf: 'center', width: '100%' },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  emptyBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
