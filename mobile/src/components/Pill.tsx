import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  label: string;
  color?: string;
  tint?: string;
  /** Makes the pill a toggle chip. */
  onPress?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export function Pill({ label, color, tint, onPress, selected, size = 'sm' }: Props) {
  const fg = selected ? colors.white : color ?? colors.primary;
  const bg = selected ? color ?? colors.primary : tint ?? colors.greenTint;
  const body = (
    <View style={[styles.pill, size === 'md' && styles.md, { backgroundColor: bg }]}>
      <Text style={[styles.text, size === 'md' && styles.mdText, { color: fg }]}>{label}</Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={styles.touch}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  touch: { alignSelf: 'flex-start' },
  pill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.sm + 2, paddingVertical: 3 },
  md: { paddingHorizontal: spacing.md, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  text: { fontFamily: fonts.bodyMedium, fontSize: 11 },
  mdText: { fontSize: 13 },
});
