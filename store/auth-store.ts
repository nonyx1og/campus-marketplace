import { create } from 'zustand';
import { AuthState, User } from '@/types/auth';
import {
  SECURE_STORE_KEYS,
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
} from '@/lib/secure-store';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isRestoringSession: true,

  signIn: async (token: string, user: User) => {
    try {
      await setSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN, token);
      await setSecureItem(SECURE_STORE_KEYS.USER_SESSION, JSON.stringify(user));
      set({ token, user, isRestoringSession: false });
    } catch (error) {
      console.error('[AuthStore] Error saving session to SecureStore:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await deleteSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN);
      await deleteSecureItem(SECURE_STORE_KEYS.USER_SESSION);
      await deleteSecureItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
      set({ token: null, user: null, isRestoringSession: false });
    } catch (error) {
      console.error('[AuthStore] Error removing session from SecureStore:', error);
      set({ token: null, user: null, isRestoringSession: false });
    }
  },

  restoreSession: async () => {
    set({ isRestoringSession: true });
    try {
      const storedToken = await getSecureItem(SECURE_STORE_KEYS.AUTH_TOKEN);
      const storedUserJson = await getSecureItem(SECURE_STORE_KEYS.USER_SESSION);

      if (storedToken && storedUserJson) {
        const user = JSON.parse(storedUserJson) as User;
        set({ token: storedToken, user, isRestoringSession: false });
      } else {
        set({ token: null, user: null, isRestoringSession: false });
      }
    } catch (error) {
      console.warn('[AuthStore] Failed to restore session from SecureStore:', error);
      set({ token: null, user: null, isRestoringSession: false });
    }
  },
}));

// Dedicated Zustand Selectors to avoid unnecessary re-renders
export const selectIsAuthenticated = (state: AuthState): boolean => Boolean(state.token);
export const selectUser = (state: AuthState): User | null => state.user;
export const selectToken = (state: AuthState): string | null => state.token;
export const selectIsRestoringSession = (state: AuthState): boolean => state.isRestoringSession;
export const selectSignIn = (state: AuthState) => state.signIn;
export const selectSignOut = (state: AuthState) => state.signOut;
export const selectRestoreSession = (state: AuthState) => state.restoreSession;
