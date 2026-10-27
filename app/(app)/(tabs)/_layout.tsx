import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Tokens } from '@/constants/tokens';
import { useCartTotalCount } from '@/store/cart-store';

export default function TabLayout() {
  const totalCartCount = useCartTotalCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Tokens.colors.primary,
        tabBarInactiveTintColor: Tokens.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Tokens.colors.surface,
          borderTopColor: Tokens.colors.borderSubtle,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: Tokens.typography.fontSizes.xs,
          fontWeight: Tokens.typography.fontWeights.medium,
        },
        tabBarItemStyle: {
          minHeight: Tokens.layout.minTouchTarget,
          minWidth: Tokens.layout.minTouchTarget,
        },
        headerStyle: {
          backgroundColor: Tokens.colors.surface,
        },
        headerTintColor: Tokens.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: Tokens.typography.fontWeights.bold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sản phẩm',
          tabBarLabel: 'Sản phẩm',
          tabBarAccessibilityLabel: 'Tab sản phẩm, mở danh mục đồ dùng sinh viên',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={typeof color === 'string' ? color : Tokens.colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          tabBarLabel: 'Yêu thích',
          tabBarAccessibilityLabel: 'Tab sản phẩm yêu thích',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="heart-outline"
              size={size}
              color={typeof color === 'string' ? color : Tokens.colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarLabel: 'Giỏ hàng',
          tabBarBadge: totalCartCount > 0 ? totalCartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Tokens.colors.error,
            color: Tokens.colors.textInverse,
            fontSize: 10,
            fontWeight: Tokens.typography.fontWeights.bold,
          },
          tabBarAccessibilityLabel: `Tab giỏ hàng sinh viên, hiện có ${totalCartCount} sản phẩm`,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={typeof color === 'string' ? color : Tokens.colors.primary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

