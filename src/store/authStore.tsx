// src/store/authStore.tsx
import { create } from "zustand";
import { getCurrentUser, fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { ensureUserExistsInDB, getUserById } from "../services/progressService";

export type Achievement = {
  id: string;
  title: string;
  createdAt: string;
};

export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: number[]; // ✅ agora array de inteiros
  precision?: number | null; // ✅ schema usa Float
  correctAnswers?: number | null;
  wrongAnswers?: number | null;
  timeSpent?: string | null;
  achievements?: Achievement[]; // ✅ lista de conquistas
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
      console.log("🔑 checkUser: verificando usuário no Cognito...");
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      console.log("📌 cognitoUser:", JSON.stringify(cognitoUser, null, 2));
      console.log("📌 session:", JSON.stringify(session, null, 2));

      const sub = cognitoUser.userId;
      const username = cognitoUser.username;
      const email = cognitoUser.signInDetails?.loginId ?? "";

      const groups = (session.tokens?.accessToken?.payload?.["cognito:groups"] ?? []) as string[];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      const baseUser: User = { userId: sub, username, email, isAdmin };

      if (!isAdmin) {
        console.log("🗄️ Garantindo usuário no DB...");
        await ensureUserExistsInDB(sub, username, email);
        const dbUser = await getUserById(sub);

        set({
          user: {
            ...baseUser,
            ...dbUser,
            modulesCompleted: dbUser?.modulesCompleted ?? [], // ✅ garante array
            achievements: dbUser?.achievements?.items ?? [], // ✅ pega lista
          },
          isLoading: false,
        });
      } else {
        set({ user: baseUser, isLoading: false });
      }
    } catch (e: any) {
      if (e?.name === "UserUnAuthenticatedException" || e?.message?.includes("not authenticated")) {
        console.log("ℹ️ Nenhum usuário logado ainda");
      } else {
        console.warn("⚠️ Erro ao checar usuário:", e?.message || e);
      }
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
          modulesCompleted: dbUser?.modulesCompleted ?? [], // ✅ garante array
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
    try {
      await amplifySignOut();
      set({ user: null, isLoading: false });
    } catch (e) {
      console.warn("⚠️ Erro ao fazer signOut:", e);
    }
  },
}));
