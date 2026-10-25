export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isRestoringSession: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}
