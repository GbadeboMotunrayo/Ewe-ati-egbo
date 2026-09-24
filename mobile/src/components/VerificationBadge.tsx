import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { colors, fonts } from '@/theme/theme';
import type { VerificationStatus } from '@/data/mockData';

// Only render a badge for a check that was actually performed (docs brand §Trust marks).
export function VerificationBadge({ status, compact }: { status: VerificationStatus; compact?: boolean }) {
  if (status !== 'trusted' && status !== 'verified') return null;
  const Icon = status === 'trusted' ? ShieldCheck : BadgeCheck;
  const label = status === 'trusted' ? 'Trusted Seller' : 'Verified Seller';
  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <Icon size={14} color={colors.primary} />
      {!compact && <Text style={styles.text}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primary },
});
