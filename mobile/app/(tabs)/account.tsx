import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Store, Truck, MapPin, Heart, LifeBuoy, ShieldCheck, ChevronRight, LogOut } from 'lucide-react-native';
import { colors, fonts, motion, radius, spacing } from '@/theme/theme';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/state/auth';
import { useLayout } from '@/hooks/useLayout';

const ROWS = [
  { icon: MapPin, label: 'Addresses' },
  { icon: Heart, label: 'Wishlist' },
  { icon: Store, label: 'Become a seller' },
  { icon: Truck, label: 'Become a cargo agent' },
  { icon: ShieldCheck, label: 'Verification & trust' },
  { icon: LifeBuoy, label: 'Help & support' },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { demoMode, session, signOut } = useAuth();
  const toast = useToast();
  const L = useLayout();

  const email = session?.user.email;
  const initials = email ? email.slice(0, 2).toUpperCase() : 'EE';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl * 2 }}>
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: L.gutter }}>
        <Animated.View entering={FadeInDown.duration(motion.base)} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{demoMode ? 'Guest (demo)' : email ?? 'Your account'}</Text>
            <Text style={styles.sub}>Shopping in the United Kingdom</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(motion.slow)}>
          <Card style={styles.card}>
            {ROWS.map((r, i) => (
              <PressableScale
                key={r.label}
                scaleTo={0.98}
                onPress={() => toast.show(`${r.label} — coming soon`, 'info')}
                style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}
                accessibilityLabel={r.label}
              >
                <View style={styles.rowIcon}><r.icon size={18} color={colors.primary} /></View>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </PressableScale>
            ))}
          </Card>
        </Animated.View>

        {session && (
          <Animated.View entering={FadeInDown.delay(140)}>
            <PressableScale onPress={() => void signOut()} style={styles.signOut} accessibilityLabel="Sign out">
              <LogOut size={16} color={colors.red} />
              <Text style={styles.signOutText}>Sign out</Text>
            </PressableScale>
          </Animated.View>
        )}

        <Text style={styles.footer}>Ewe ati Egbo · leaves and roots, moved with trust</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 18, color: colors.white },
  name: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  card: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, minHeight: 56 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowIcon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text, flex: 1 },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.lg, paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.redTint },
  signOutText: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.red },
  footer: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
