import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, Truck, MapPin, Heart, LifeBuoy, ShieldCheck } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { Card } from '@/components/Card';
import { useAuth } from '@/state/auth';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { demoMode } = useAuth();

  const rows = [
    { icon: MapPin, label: 'Addresses' },
    { icon: Heart, label: 'Wishlist' },
    { icon: Store, label: 'Become a seller' },
    { icon: Truck, label: 'Become a cargo agent' },
    { icon: ShieldCheck, label: 'Verification & trust' },
    { icon: LifeBuoy, label: 'Help & support' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EE</Text>
        </View>
        <View>
          <Text style={styles.name}>{demoMode ? 'Guest (demo)' : 'Your account'}</Text>
          <Text style={styles.sub}>Shopping in the United Kingdom</Text>
        </View>
      </View>

      <Card style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
            <r.icon size={18} color={colors.primary} />
            <Text style={styles.rowLabel}>{r.label}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.footer}>Ewe ati Egbo · leaves and roots, moved with trust</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 18, color: colors.white },
  name: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  card: { marginHorizontal: spacing.md, padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  footer: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
