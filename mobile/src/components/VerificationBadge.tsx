import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { colors, fonts } from '@/theme/theme';
import type { VerificationStatus } from '@/data/mockData';

// Only render a badge for a check that was actually performed (docs brand §Trust marks).
export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === 'trusted') {
    return (
      <View style={styles.row}>
        <ShieldCheck size={14} color={colors.primary} />
        <Text style={styles.text}>Trusted Seller</Text>
      </View>
    );
  }
  if (status === 'verified') {
    return (
      <View style={styles.row}>
        <BadgeCheck size={14} color={colors.primary} />
        <Text style={styles.text}>Verified Seller</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primary },
});
