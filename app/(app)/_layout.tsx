import { Stack } from 'expo-router';
import { Tokens } from '@/constants/tokens';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Tokens.colors.surface,
        },
        headerTintColor: Tokens.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: Tokens.typography.fontWeights.bold,
        },
        contentStyle: {
          backgroundColor: Tokens.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="listing/[id]"
        options={{
          title: 'Chi tiết sản phẩm',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="modal/create-listing"
        options={{
          presentation: 'modal',
          title: 'Đăng tin mới',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
