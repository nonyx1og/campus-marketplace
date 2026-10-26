import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { ScreenStateView } from '@/components/common/ScreenStateView';
import { AppText } from '@/components/primitives/AppText';
import { AppInput } from '@/components/primitives/AppInput';
import { AppButton } from '@/components/primitives/AppButton';
import { useAuthStore, selectSignInWithCredentials } from '@/store/auth-store';
import { validateEmail, validatePassword } from '@/lib/auth';
import { ScreenViewState } from '@/types/domain';

export default function SignInScreen() {
  const theme = useTheme();
  const signInWithCredentials = useAuthStore(selectSignInWithCredentials);

  // Form State
  const [viewState, setViewState] = useState<ScreenViewState>('content');
  const [email, setEmail] = useState('sinhvien@campus.edu.vn');
  const [password, setPassword] = useState('password123');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Form Submission with Validation
  const handleSignIn = async () => {
    // 1. Validate Email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setEmailError(emailResult.error);
      return;
    }
    setEmailError(undefined);

    // 2. Validate Password
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      setPasswordError(passwordResult.error);
      return;
    }
    setPasswordError(undefined);

    setIsSubmitting(true);
    setViewState('loading');
    setErrorMessage('');

    try {
      await signInWithCredentials({
        email: email.trim(),
        password,
      });
      // Route protection in RootLayout will automatically transition to /(app)/(tabs)
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      const msg = apiErr?.message || 'Không thể đăng nhập. Vui lòng kiểm tra kết nối mạng và thử lại.';
      setErrorMessage(msg);
      setViewState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setViewState('content');
    setErrorMessage('');
  };

  // Quick Preset Accounts for testing & grading evaluation
  const setPresetAccount = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setEmailError(undefined);
    setPasswordError(undefined);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScreenStateView
        state={viewState}
        onRetry={handleRetry}
        onStateChange={setViewState}
        loadingMessage="Đang xác thực thông tin tài khoản qua remote API..."
        errorMessage={errorMessage || 'Xác thực không thành công. Vui lòng thử lại.'}
        emptyTitle="Chưa có phiên làm việc"
        emptyMessage="Vui lòng nhập tài khoản email sinh viên để bắt đầu sử dụng Campus Marketplace."
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.colors.primaryBg,
                  borderRadius: theme.radius.pill,
                },
              ]}
              accessibilityRole="image"
              accessibilityLabel="Biểu trưng Campus Marketplace"
            >
              <AppText variant="heading" style={styles.appIcon}>
                🎓
              </AppText>
            </View>
            <AppText variant="heading" align="center" style={styles.title}>
              Campus Marketplace
            </AppText>
            <AppText variant="muted" align="center" style={styles.subtitle}>
              Sàn giao dịch đồ dùng sinh viên an toàn trong khuôn viên trường
            </AppText>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <AppText variant="title" style={styles.cardTitle}>
              Đăng nhập sinh viên
            </AppText>

            {/* Email Field */}
            <AppInput
              label="Email trường (@campus.edu.vn)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
              }}
              placeholder="sinhvien@campus.edu.vn"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              helperText={
                !emailError && email.includes('@') && !email.endsWith('.edu.vn')
                  ? 'Gợi ý: Dùng email đuôi .edu.vn để truy cập đầy đủ tính năng trường'
                  : undefined
              }
              showClearButton={Boolean(email)}
              onClear={() => setEmail('')}
              accessibilityLabel="Trường nhập email sinh viên"
              testID="input-email"
            />

            {/* Password Field */}
            <AppInput
              label="Mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(undefined);
              }}
              placeholder="Tối thiểu 6 ký tự"
              secureTextEntry
              error={passwordError}
              accessibilityLabel="Trường nhập mật khẩu"
              testID="input-password"
            />

            {/* Submit Button */}
            <AppButton
              title="Đăng nhập"
              onPress={handleSignIn}
              isLoading={isSubmitting}
              variant="primary"
              accessibilityLabel="Nhấn để đăng nhập vào tài khoản sinh viên"
              style={styles.submitBtn}
            />

            {/* Quick Demo Presets for Grading / Testing */}
            <View style={[styles.demoSection, { borderTopColor: theme.colors.borderSubtle }]}>
              <AppText variant="caption" style={styles.demoLabel}>
                Tài khoản kiểm thử nhanh (Demo Viva / Chấm điểm):
              </AppText>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.presetChip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                  onPress={() => setPresetAccount('sinhvien@campus.edu.vn', 'password123')}
                  accessibilityRole="button"
                  accessibilityLabel="Chọn tài khoản mẫu Người mua sinh viên"
                >
                  <AppText variant="caption">👤 Người mua</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetChip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                  onPress={() => setPresetAccount('seller@campus.edu.vn', 'password123')}
                  accessibilityRole="button"
                  accessibilityLabel="Chọn tài khoản mẫu Người bán sinh viên"
                >
                  <AppText variant="caption">🏷️ Người bán</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetChip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                  onPress={() => setPresetAccount('admin@campus.edu.vn', 'adminpassword')}
                  accessibilityRole="button"
                  accessibilityLabel="Chọn tài khoản mẫu Quản trị viên"
                >
                  <AppText variant="caption">🛡️ Quản trị</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenStateView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    maxWidth: 320,
    lineHeight: 20,
  },
  card: {
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  demoLabel: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    minHeight: 44, // WCAG Touch Target 44x44
    minWidth: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
