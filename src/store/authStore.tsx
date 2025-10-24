import { create } from "zustand";
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { ensureUserExistsInDB, getUserById } from "../services/progressService";

export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: number[];
  currentModule?: number | null;
  precision?: number | null;
  correctAnswers?: number | null;
  timeSpent?: string | null;
  achievements?: { id: string; title: string; createdAt: string }[];
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
      const session = await fetchAuthSession();

      // Normalize different Amplify session shapes
      let idPayload: any = {};
      let accessPayload: any = {};
      if ((session as any)?.tokens?.idToken?.payload) {
        idPayload = (session as any).tokens.idToken.payload;
        accessPayload = (session as any).tokens.accessToken?.payload ?? {};
      } else if (typeof (session as any).getIdToken === "function") {
        const idToken = (session as any).getIdToken();
        const accessToken = (session as any).getAccessToken?.();
        idPayload = idToken?.payload ?? {};
        accessPayload = accessToken?.payload ?? {};
      } else {
        idPayload = (session as any).idToken ?? {};
        accessPayload = (session as any).accessToken ?? {};
      }

      const sub = String(idPayload.sub ?? idPayload["cognito:username"] ?? "");
      const rawEmail = idPayload.email ?? "";
      const emailStr = typeof rawEmail === "string" ? rawEmail : String(rawEmail ?? "");
      const usernameFromEmail = emailStr.includes("@") ? emailStr.split("@")[0] : emailStr;
      const username = String(idPayload["cognito:username"] ?? usernameFromEmail ?? "");
      const email = String(emailStr ?? "");

      const groups =
        ((accessPayload["cognito:groups"] ?? idPayload["cognito:groups"] ?? []) as string[]) ?? [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      const baseUser: User = { userId: sub, username, email, isAdmin };

      if (isAdmin) {
        set({ user: baseUser, isLoading: false });
        return;
      }

      if (!sub) {
        set({ user: null, isLoading: false });
        return;
      }

      const dbUser = await ensureUserExistsInDB(sub);
      if (!dbUser) {
        set({ user: null, isLoading: false });
        return;
      }

      set({
        user: {
          ...baseUser,
          ...dbUser,
          achievements: dbUser?.achievements?.items ?? [],
        },
        isLoading: false,
      });
    } catch (e) {
      console.warn("⚠️ checkUser erro:", e);
      set({ user: null, isLoading: false });
    }
  },

  refreshUserFromDB: async () => {
    try {
      const u = get().user;
      if (!u) return;
      const dbUser = await getUserById(u.userId);
      set({
        user: {
          ...u,
          ...dbUser,
          achievements: dbUser?.achievements?.items ?? [],
        },
      });
    } catch (e) {
      console.warn("⚠️ Erro ao atualizar dados do usuário:", e);
    }
  },

  updateUserData: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  signOut: async () => {
    set({ user: null });
    try {
      await amplifySignOut({ global: true });
    } catch (e) {
      console.warn("⚠️ Erro ao fazer signOut no Amplify:", e);
    }
  },
}));