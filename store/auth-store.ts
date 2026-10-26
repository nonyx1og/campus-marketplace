import { create } from 'zustand';
import { AuthState, User, SignInCredentials } from '@/types/auth';
import { apiSignIn, apiSignOut, apiClient } from '@/lib/api';
import {
  persistSession,
  restoreSessionFromStorage,
  clearSensitiveUserData,
} from '@/lib/auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isRestoringSession: true,

  /**
   * Overloaded signIn supporting:
   * 1. signIn(credentials: SignInCredentials) or signIn(email, password)
   * 2. signIn(token: string, user: User) - direct session save
   */
  signIn: async (tokenOrEmail: string, userOrPassword?: User | string) => {
    if (typeof userOrPassword === 'object' && userOrPassword !== null) {
      // Direct session restore / internal token+user setting
      const token = tokenOrEmail;
      const user = userOrPassword as User;
      await persistSession({ user, token });
      set({ token, user, isRestoringSession: false });
      return;
    }

    // Email + Password login
    const email = tokenOrEmail;
    const password = typeof userOrPassword === 'string' ? userOrPassword : '';
    const session = await apiSignIn({ email, password });
    await persistSession(session);
    set({ token: session.token, user: session.user, isRestoringSession: false });
  },

  /**
   * Explicit typed credentials sign-in
   */
  signInWithCredentials: async (credentials: SignInCredentials): Promise<User> => {
    const session = await apiSignIn(credentials);
    await persistSession(session);
    set({ token: session.token, user: session.user, isRestoringSession: false });
    return session.user;
  },

  /**
   * Sign out: Purges tokens from SecureStore, clears TanStack Query cache,
   * resets local Zustand state and notifies remote API.
   */
  signOut: async () => {
    // 1. Fire-and-forget remote logout notification
    apiSignOut().catch(() => {
      // Ignore background logout failure
    });

    // 2. Clear SecureStore keys and queryClient cache
    await clearSensitiveUserData();

    // 3. Reset client state
    set({ token: null, user: null, isRestoringSession: false });
  },

  /**
   * Restore session on app start from SecureStore
   */
  restoreSession: async () => {
    set({ isRestoringSession: true });
    try {
      const restored = await restoreSessionFromStorage();
      if (restored) {
        set({ token: restored.token, user: restored.user, isRestoringSession: false });
      } else {
        set({ token: null, user: null, isRestoringSession: false });
      }
    } catch {
      set({ token: null, user: null, isRestoringSession: false });
    }
  },
}));

// Automatically trigger local sign-out when HTTP client encounters 401 Unauthorized
apiClient.onUnauthorized(() => {
  useAuthStore.getState().signOut();
});

// Dedicated Zustand Selectors to avoid unnecessary re-renders
export const selectIsAuthenticated = (state: AuthState): boolean => Boolean(state.token);
export const selectUser = (state: AuthState): User | null => state.user;
export const selectToken = (state: AuthState): string | null => state.token;
export const selectIsRestoringSession = (state: AuthState): boolean => state.isRestoringSession;
export const selectSignIn = (state: AuthState) => state.signIn;
export const selectSignInWithCredentials = (state: AuthState) => state.signInWithCredentials;
export const selectSignOut = (state: AuthState) => state.signOut;
export const selectRestoreSession = (state: AuthState) => state.restoreSession;
