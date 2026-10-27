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
import { ThemeProvider, useTheme } from '@/constants/theme';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();
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
        style={[styles.splashContainer, { backgroundColor: theme.colors.background }]}
        accessibilityRole="alert"
        accessibilityLabel="Đang khôi phục phiên đăng nhập từ SecureStore"
        accessibilityLiveRegion="polite"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.splashText, { color: theme.colors.text }]}>Campus Marketplace</Text>
        <Text style={[styles.splashSubtext, { color: theme.colors.mutedText }]}>
          Đang khôi phục phiên làm việc...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

function RootAppContent() {
  const theme = useTheme();

  return (
    <NavigationGuard>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </NavigationGuard>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RootAppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashText: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
  },
  splashSubtext: {
    marginTop: 4,
    fontSize: 14,
  },
});
