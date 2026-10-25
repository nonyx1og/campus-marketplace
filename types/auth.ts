import { User, UserRole } from './domain';

export type { User, UserRole };

export interface AuthState {
  user: User | null;
  token: string | null;
  isRestoringSession: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}
