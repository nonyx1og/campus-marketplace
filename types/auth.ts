import { User, UserRole } from './domain';

export type { User, UserRole };

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isRestoringSession: boolean;
  /**
   * Overloaded signature:
   * 1. signIn(token, user) - direct session save (legacy & internal)
   * 2. signIn(email, password) - API login
   */
  signIn: (tokenOrEmail: string, userOrPassword?: User | string) => Promise<void>;
  signInWithCredentials: (credentials: SignInCredentials) => Promise<User>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}
