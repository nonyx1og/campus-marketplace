import { Stack } from 'expo-router';
import { Tokens } from '@/constants/tokens';

export default function AuthLayout() {
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
        name="sign-in"
        options={{
          title: 'Đăng nhập',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
