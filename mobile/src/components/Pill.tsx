import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';

export function Pill({ label, color, tint }: { label: string; color?: string; tint?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint ?? colors.greenTint }]}>
      <Text style={[styles.text, { color: color ?? colors.primary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  text: { fontFamily: fonts.bodyMedium, fontSize: 11 },
});
