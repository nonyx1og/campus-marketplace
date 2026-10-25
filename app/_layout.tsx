import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import {
  useAuthStore,
  selectIsAuthenticated,
  selectIsRestoringSession,
  selectRestoreSession,
} from '@/store/auth-store';
import { Tokens } from '@/constants/tokens';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isRestoringSession = useAuthStore(selectIsRestoringSession);
  const restoreSession = useAuthStore(selectRestoreSession);

  // Restore session from SecureStore on startup
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Route protection between (auth) and (app)
  useEffect(() => {
    if (isRestoringSession) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to sign-in
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users to catalogue tabs
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isRestoringSession, segments, router]);

  if (isRestoringSession) {
    return (
      <View
        style={styles.splashContainer}
        accessibilityRole="alert"
        accessibilityLabel="Đang khôi phục phiên đăng nhập từ SecureStore"
      >
        <ActivityIndicator size="large" color={Tokens.colors.primary} />
        <Text style={styles.splashText}>Campus Marketplace</Text>
        <Text style={styles.splashSubtext}>Đang khôi phục phiên làm việc...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationGuard>
        <StatusBar style="dark" />
        <Slot />
      </NavigationGuard>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.xl,
  },
  splashText: {
    marginTop: Tokens.spacing.lg,
    fontSize: Tokens.typography.fontSizes.xl,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
  },
  splashSubtext: {
    marginTop: Tokens.spacing.xs,
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
  },
});
