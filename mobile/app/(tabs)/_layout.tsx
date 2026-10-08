import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
import { Home, Search, Package, User, type LucideIcon } from 'lucide-react-native';
import { colors, fonts, radius, shadow } from '@/theme/theme';
import { useLayout, useTabBarSpace } from '@/hooks/useLayout';
import { Glass } from '@/components/Glass';

/**
 * Active tab = a soft green capsule fading in behind the icon. Tab switches happen
 * dozens of times a session, so this is a 150ms fade — no bounce, no slide.
 */
function TabIcon({ Icon, color, size, focused }: { Icon: LucideIcon; color: string; size: number; focused: boolean }) {
  const on = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    on.set(withTiming(focused ? 1 : 0, { duration: 150, easing: EASE_OUT }));
  }, [focused, on]);
  const pill = useAnimatedStyle(() => ({ opacity: on.get(), transform: [{ scale: 0.85 + 0.15 * on.get() }] }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.activePill, pill]} />
      <Icon color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  const { isDesktop } = useLayout();
  const { barHeight, bottomGap } = useTabBarSpace();

  return (
    <Tabs
      // The floating bar handles the home-indicator gap itself.
      safeAreaInsets={isDesktop ? undefined : { bottom: 0 }}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarVariant: isDesktop ? 'material' : 'uikit',
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: isDesktop ? 14 : 11, marginTop: isDesktop ? 0 : 2 },
        tabBarItemStyle: isDesktop ? { borderRadius: 14, marginHorizontal: 10, marginVertical: 3 } : { paddingTop: 6 },
        tabBarActiveBackgroundColor: isDesktop ? 'rgba(31,107,59,0.12)' : undefined,
        tabBarBackground: () =>
          isDesktop ? (
            <Glass style={StyleSheet.absoluteFill} radius={0} sheen={false} />
          ) : (
            <Glass style={StyleSheet.absoluteFill} radius={radius.lg + 8} />
          ),
        tabBarStyle: isDesktop
          ? { backgroundColor: 'transparent', borderRightWidth: 0, minWidth: 220, paddingTop: 28 }
          : {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: bottomGap,
              height: barHeight,
              paddingBottom: 6,
              borderRadius: radius.lg + 8,
              borderTopWidth: 0,
              backgroundColor: 'transparent',
              ...shadow.lg,
            },
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: (p) => <TabIcon Icon={Home} {...p} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: (p) => <TabIcon Icon={Search} {...p} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: (p) => <TabIcon Icon={Package} {...p} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: (p) => <TabIcon Icon={User} {...p} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 52, height: 30, alignItems: 'center', justifyContent: 'center' },
  activePill: { ...StyleSheet.absoluteFillObject, borderRadius: 15, backgroundColor: 'rgba(31,107,59,0.14)' },
});
