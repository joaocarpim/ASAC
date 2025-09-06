// src/store/authStore.tsx
import { create } from "zustand";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";
import { ensureUserExistsInDB, getUserById } from "../services/progressService";

export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: string | null;
  precision?: string | null;
  correctAnswers?: number | null;
  timeSpent?: string | null;
  achievements?: any[];
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  checkUser: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
  signOut: () => Promise<void>;
  refreshUserFromDB: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  checkUser: async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const sub = cognitoUser.userId;
      const username = cognitoUser.username;
      const email = cognitoUser.signInDetails?.loginId ?? "";
      const groups =
        session.tokens?.accessToken?.payload?.["cognito:groups"] ?? [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      const baseUser: User = {
        userId: sub,
        username,
        email,
        isAdmin,
      };

      if (!isAdmin) {
        await ensureUserExistsInDB(sub, username, email);
        const dbUser = await getUserById(sub);
        set({ user: { ...baseUser, ...dbUser }, isLoading: false });
      } else {
        set({ user: baseUser, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  refreshUserFromDB: async () => {
    try {
      const u = get().user;
      if (!u) return;
      const dbUser = await getUserById(u.userId);
      set({ user: { ...u, ...dbUser } });
    } catch {
      /* ignore */
    }
  },

  updateUserData: (data) =>
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

  signOut: async () => {
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch {
      /* ignore */
    }
  },
}));
