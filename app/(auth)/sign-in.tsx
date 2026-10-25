import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { Button } from '@/components/common/Button';
import { useAuthStore, selectSignIn } from '@/store/auth-store';
import { Tokens } from '@/constants/tokens';
import { ScreenViewState } from '@/types/listing';

export default function SignInScreen() {
  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const [email, setEmail] = useState('sinhvien@campus.edu.vn');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const signIn = useAuthStore(selectSignIn);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      setViewState('error');
      return;
    }

    setIsSubmitting(true);
    setViewState('loading');

    try {
      // Simulate API auth call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock user & token saved to SecureStore via Zustand auth store
      const mockToken = `sec_token_${Date.now()}`;
      await signIn(mockToken, {
        id: 'usr_student_01',
        email: email.trim(),
        fullName: 'Nguyễn Văn Sinh Viên',
        studentId: 'SV2024001',
      });
      // Navigation will be handled automatically by RootLayout route protection
    } catch (err) {
      setErrorMessage('Không thể đăng nhập. Vui lòng kiểm tra kết nối mạng.');
      setViewState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setViewState('content');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScreenStateView
        state={viewState}
        onRetry={handleRetry}
        onStateChange={setViewState}
        loadingMessage="Đang xác thực thông tin tài khoản..."
        errorMessage={errorMessage || 'Xác thực không thành công. Vui lòng thử lại.'}
        emptyTitle="Chưa có phiên làm việc"
        emptyMessage="Vui lòng đăng nhập bằng tài khoản email sinh viên để truy cập Campus Marketplace."
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.appIcon}>🎓</Text>
            </View>
            <Text style={styles.title}>Campus Marketplace</Text>
            <Text style={styles.subtitle}>
              Sàn giao dịch đồ dùng sinh viên an toàn trong khuôn viên trường
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formLabel}>Email sinh viên (.edu.vn)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@campus.edu.vn"
              placeholderTextColor={Tokens.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              accessibilityRole="text"
              accessibilityLabel="Nhập email sinh viên"
            />

            <Text style={styles.formLabel}>Mật khẩu</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Tokens.colors.textMuted}
              secureTextEntry
              style={styles.input}
              accessibilityRole="text"
              accessibilityLabel="Nhập mật khẩu"
            />

            <Button
              title="Đăng nhập"
              onPress={handleSignIn}
              isLoading={isSubmitting}
              accessibilityLabel="Nhấn để đăng nhập vào tài khoản"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </ScreenStateView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Tokens.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Tokens.borderRadius.pill,
    backgroundColor: Tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.md,
  },
  appIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: Tokens.typography.fontSizes.xxl,
    fontWeight: Tokens.typography.fontWeights.bold,
    color: Tokens.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Tokens.spacing.xs,
    fontSize: Tokens.typography.fontSizes.sm,
    color: Tokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Tokens.typography.lineHeights.sm,
  },
  card: {
    backgroundColor: Tokens.colors.surface,
    padding: Tokens.spacing.xl,
    borderRadius: Tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.borderSubtle,
  },
  formLabel: {
    fontSize: Tokens.typography.fontSizes.sm,
    fontWeight: Tokens.typography.fontWeights.medium,
    color: Tokens.colors.textPrimary,
    marginBottom: Tokens.spacing.xs,
  },
  input: {
    minHeight: Tokens.layout.minTouchTarget, // Enforce min 44x44
    borderWidth: 1,
    borderColor: Tokens.colors.borderStrong,
    borderRadius: Tokens.borderRadius.md,
    paddingHorizontal: Tokens.spacing.md,
    fontSize: Tokens.typography.fontSizes.md,
    color: Tokens.colors.textPrimary,
    backgroundColor: Tokens.colors.surface,
    marginBottom: Tokens.spacing.md,
  },
  submitBtn: {
    marginTop: Tokens.spacing.sm,
  },
});
