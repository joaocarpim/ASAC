import { create } from "zustand";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
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
      const session = await fetchAuthSession({ forceRefresh: true });
      const tokens = session?.tokens;
      if (!tokens) {
        set({ user: null, isLoading: false });
        return;
      }

      const sub = tokens.accessToken?.payload.sub as string;
      const username = tokens.accessToken?.payload["username"] as string;
      const email = tokens.idToken?.payload["email"] as string;

      const cognitoGroups = tokens.accessToken?.payload["cognito:groups"];
      const isAdmin = Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins");

      const baseUser: User = {
        userId: sub,
        username,
        email,
        name: username,
        isAdmin,
      };

      if (!isAdmin) {
        await ensureUserExistsInDB(baseUser.userId, baseUser.username, baseUser.email);
        const dbUser = await getUserById(baseUser.userId);
        set({ user: { ...baseUser, ...dbUser }, isLoading: false });
      } else {
        set({ user: baseUser, isLoading: false });
      }
    } catch (e) {
      console.error("Erro checkUser:", e);
      set({ user: null, isLoading: false });
    }
  },

  refreshUserFromDB: async () => {
    try {
      const u = get().user;
      if (!u) return;
      const dbUser = await getUserById(u.userId);
      set({ user: { ...u, ...dbUser } });
    } catch (e) {
      console.warn("refreshUserFromDB fail:", e);
    }
  },

  updateUserData: (data) =>
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

  signOut: async () => {
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      console.log("Erro signOut:", error);
    }
  },
}));
