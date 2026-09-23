import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Home, Search, Package, User, type LucideIcon } from 'lucide-react-native';
import { colors, fonts, motion, shadow } from '@/theme/theme';
import { useLayout } from '@/hooks/useLayout';

/** Tab icon that springs up a little when its tab becomes active. */
function TabIcon({ Icon, color, size, focused }: { Icon: LucideIcon; color: string; size: number; focused: boolean }) {
  const s = useSharedValue(focused ? 1.12 : 1);
  useEffect(() => {
    s.value = withSpring(focused ? 1.12 : 1, motion.pop);
  }, [focused, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={style}>
      <Icon color={color} size={size} strokeWidth={focused ? 2.4 : 2} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { isDesktop } = useLayout();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Desktop web: a left sidebar instead of a stretched bottom bar.
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarVariant: isDesktop ? 'material' : 'uikit',
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: isDesktop ? colors.greenTint : undefined,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: isDesktop ? 14 : 12 },
        tabBarItemStyle: isDesktop ? { borderRadius: 12, marginHorizontal: 8, marginVertical: 2 } : undefined,
        tabBarStyle: isDesktop
          ? { backgroundColor: colors.surface, borderRightColor: colors.border, minWidth: 200, paddingTop: 24 }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: Platform.OS === 'web' ? 64 : undefined,
              paddingTop: 6,
              ...shadow.sm,
            },
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: (p) => <TabIcon Icon={Home} {...p} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: (p) => <TabIcon Icon={Search} {...p} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: (p) => <TabIcon Icon={Package} {...p} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: (p) => <TabIcon Icon={User} {...p} /> }} />
    </Tabs>
  );
}
