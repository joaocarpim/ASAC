import { create } from "zustand";
import { getCurrentUser, fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { ensureUserExistsInDB, getUserById } from "../services/progressService";

export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: number[]; // ajustado para array
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

      if (isAdmin) {
        console.log("👑 Usuário é Admin, acesso liberado.");
        set({ user: baseUser, isLoading: false });
        return;
      }

      console.log("🗄️ Buscando usuário no DB...");
      const dbUser = await ensureUserExistsInDB(sub);

      if (!dbUser) {
        console.warn("⚠️ Usuário não existe no DB. Um Admin precisa registrá-lo.");
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
