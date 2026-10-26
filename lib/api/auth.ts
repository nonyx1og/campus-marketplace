import { apiClient } from './client';
import { apiConfig, isRemoteApiConfigured } from './config';
import { User, SignInCredentials, AuthSessionResponse } from '@/types/auth';
import { ApiError } from '@/types/domain';

// Predefined demo accounts for grading review & local testing without live server
const DEMO_ACCOUNTS: Record<string, { user: User; password: string }> = {
  'sinhvien@campus.edu.vn': {
    user: {
      id: 'usr_student_01',
      name: 'Nguyễn Văn Sinh Viên',
      fullName: 'Nguyễn Văn Sinh Viên',
      role: 'buyer',
      email: 'sinhvien@campus.edu.vn',
      studentId: 'SV2024001',
    },
    password: 'password123',
  },
  'seller@campus.edu.vn': {
    user: {
      id: 'usr_seller_02',
      name: 'Trần Thị Người Bán',
      fullName: 'Trần Thị Người Bán',
      role: 'seller',
      email: 'seller@campus.edu.vn',
      studentId: 'SV2024002',
    },
    password: 'password123',
  },
  'admin@campus.edu.vn': {
    user: {
      id: 'usr_admin_99',
      name: 'Ban Quản Lý Campus',
      fullName: 'Ban Quản Lý Campus',
      role: 'admin',
      email: 'admin@campus.edu.vn',
      studentId: 'BQL001',
    },
    password: 'adminpassword',
  },
};

/**
 * Sign in with email and password via remote API
 */
export async function apiSignIn(credentials: SignInCredentials): Promise<AuthSessionResponse> {
  const { email, password } = credentials;

  // If a custom remote API is configured, call remote endpoint first
  if (isRemoteApiConfigured()) {
    try {
      const response = await apiClient.post<AuthSessionResponse>(
        '/auth/login',
        { email: email.trim(), password },
        { requiresAuth: false }
      );
      return response;
    } catch (error) {
      // If mock fallback is disabled, throw the remote error directly
      if (!apiConfig.isMockFallbackEnabled) {
        throw error;
      }
      // Otherwise fall through to local demo account checking
    }
  }

  // Local/Offline Fallback Authentication
  // Simulates realistic network delay (600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmedEmail = email.trim().toLowerCase();
  const demoAccount = DEMO_ACCOUNTS[trimmedEmail];

  if (demoAccount) {
    if (demoAccount.password !== password) {
      const err: ApiError = {
        code: 'AUTH_INVALID_PASSWORD',
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        status: 401,
        timestamp: new Date().toISOString(),
      };
      throw err;
    }

    return {
      user: demoAccount.user,
      token: `cm_jwt_token_${demoAccount.user.id}_${Date.now()}`,
      refreshToken: `cm_refresh_token_${demoAccount.user.id}_${Date.now()}`,
      expiresIn: 86400,
    };
  }

  // Any other valid email gets a buyer account
  const username = trimmedEmail.split('@')[0] || 'Sinh viên';
  const genericUser: User = {
    id: `usr_${Date.now()}`,
    name: username.toUpperCase(),
    fullName: username.toUpperCase(),
    role: 'buyer',
    email: trimmedEmail,
    studentId: `SV${Math.floor(100000 + Math.random() * 900000)}`,
  };

  return {
    user: genericUser,
    token: `cm_jwt_token_${genericUser.id}_${Date.now()}`,
    refreshToken: `cm_refresh_token_${genericUser.id}_${Date.now()}`,
    expiresIn: 86400,
  };
}

/**
 * Sign out session on remote backend
 */
export async function apiSignOut(): Promise<void> {
  if (isRemoteApiConfigured()) {
    try {
      await apiClient.post<void>('/auth/logout', {}, { requiresAuth: true });
    } catch {
      // Remote logout failures do not block local session purge
    }
  }
}

/**
 * Fetch current user profile from remote backend
 */
export async function apiGetCurrentUser(): Promise<User> {
  return apiClient.get<User>('/auth/me', { requiresAuth: true });
}

/**
 * Refresh expired access token
 */
export async function apiRefreshToken(refreshToken: string): Promise<string> {
  const response = await apiClient.post<{ token: string }>(
    '/auth/refresh',
    { refreshToken },
    { requiresAuth: false }
  );
  return response.token;
}
