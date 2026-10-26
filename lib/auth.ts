import {
  SECURE_STORE_KEYS,
  getSecureItem,
  setSecureItem,
  deleteSecureItem,
} from './secure-store';
import { queryClient } from './query-client';
import { User, AuthSessionResponse } from '@/types/auth';

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isCampusEmail: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email with special emphasis on Campus educational emails (.edu.vn)
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Vui lòng nhập địa chỉ email của bạn.',
      isCampusEmail: false,
    };
  }

  // Standard email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Định dạng email không hợp lệ. Ví dụ: sinhvien@campus.edu.vn',
      isCampusEmail: false,
    };
  }

  const isCampus = trimmed.endsWith('.edu.vn') || trimmed.includes('campus');
  return {
    isValid: true,
    isCampusEmail: isCampus,
  };
}

/**
 * Validates password length and basic complexity
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Vui lòng nhập mật khẩu.',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có tối thiểu 6 ký tự.',
    };
  }

  return { isValid: true };
}

/**
 * Persists session tokens and user data securely to SecureStore.
 * SECURITY: Never write tokens to AsyncStorage or console.log them!
 */
export async function persistSession(session: AuthSessionResponse): Promise<void> {
  await setSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN, session.token);
  await setSecureItem(SECURE_STORE_KEYS.USER_SESSION, JSON.stringify(session.user));
  if (session.refreshToken) {
    await setSecureItem(SECURE_STORE_KEYS.REFRESH_TOKEN, session.refreshToken);
  }
}

/**
 * Restores user session from SecureStore on application startup.
 */
export async function restoreSessionFromStorage(): Promise<{ user: User; token: string } | null> {
  try {
    const token = await getSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN);
    const userJson = await getSecureItem(SECURE_STORE_KEYS.USER_SESSION);

    if (token && userJson) {
      const user = JSON.parse(userJson) as User;
      return { user, token };
    }
  } catch {
    // If JSON parsing or retrieval fails, return null
  }
  return null;
}

/**
 * Clears all local sensitive data, SecureStore tokens, and TanStack Query cache.
 * SECURITY RULE: Sign out must clear sensitive queries/cache.
 */
export async function clearSensitiveUserData(): Promise<void> {
  try {
    await deleteSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN);
    await deleteSecureItem(SECURE_STORE_KEYS.USER_SESSION);
    await deleteSecureItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
  } catch {
    // Ignore deletion errors
  }

  // Purge TanStack Query cache completely to prevent user data leakage
  try {
    queryClient.clear();
  } catch {
    // Ignore cache clear error
  }
}
