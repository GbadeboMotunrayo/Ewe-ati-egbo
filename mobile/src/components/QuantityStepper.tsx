import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/theme/theme';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  max?: number;
  label: string; // item name, for screen readers
  size?: 'sm' | 'md';
  /** At 1, show a bin that removes the line (basket) — or just stop at 1 (product page). */
  allowRemove?: boolean;
}

/** −  2  + . At quantity 1 the minus becomes a bin, so removing is one clear tap. */
export function QuantityStepper({ value, onIncrement, onDecrement, max = 20, label, size = 'md', allowRemove = true }: Props) {
  const atMin = value <= 1;
  const showBin = atMin && allowRemove;
  const s = size === 'sm' ? 32 : 40;
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <View style={[styles.wrap, { height: s }]} accessibilityRole="adjustable" accessibilityLabel={`${label} quantity`} accessibilityValue={{ now: value, min: 0, max }}>
      <PressableScale
        onPress={onDecrement}
        disabled={atMin && !allowRemove}
        haptic
        scaleTo={0.85}
        style={[styles.btn, { width: s, height: s }, atMin && !allowRemove && { opacity: 0.35 }]}
        accessibilityLabel={showBin ? `Remove ${label}` : `Decrease ${label}`}
      >
        {showBin ? <Trash2 size={iconSize} color={colors.red} /> : <Minus size={iconSize} color={colors.text} />}
      </PressableScale>
      <Animated.View key={value} entering={ZoomIn.springify().damping(14)} style={styles.valueBox}>
        <Text style={[styles.value, size === 'sm' && { fontSize: 14 }]}>{value}</Text>
      </Animated.View>
      <PressableScale
        onPress={onIncrement}
        disabled={value >= max}
        haptic
        scaleTo={0.85}
        style={[styles.btn, { width: s, height: s }, value >= max && { opacity: 0.4 }]}
        accessibilityLabel={`Increase ${label}`}
      >
        <Plus size={iconSize} color={colors.text} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  btn: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  valueBox: { minWidth: 26, alignItems: 'center', paddingHorizontal: spacing.xs },
  value: { fontFamily: fonts.headingMedium, fontSize: 15, color: colors.text },
});
