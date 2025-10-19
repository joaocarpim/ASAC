import { create } from "zustand";
import {
  getCurrentUser,
  fetchAuthSession,
  signOut as amplifySignOut,
} from "aws-amplify/auth";
import { ensureUserExistsInDB, getUserById } from "../services/progressService";

// ... (Sua tipagem 'User' e 'AuthState' permanecem as mesmas)
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

  // A função checkUser permanece a mesma
  checkUser: async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const sub = cognitoUser.userId;
      const username = cognitoUser.username;
      const email = cognitoUser.signInDetails?.loginId ?? "";
      const groups = (session.tokens?.accessToken?.payload?.[
        "cognito:groups"
      ] ?? []) as string[];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");
      const baseUser: User = { userId: sub, username, email, isAdmin };

      if (isAdmin) {
        set({ user: baseUser, isLoading: false });
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
      set({ user: null, isLoading: false });
    }
  },

  // A função refreshUserFromDB permanece a mesma
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

  // A função updateUserData permanece a mesma
  updateUserData: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  // ✅ FUNÇÃO SIGNOUT CORRIGIDA
  signOut: async () => {
    // Primeiro, limpa o estado local IMEDIATAMENTE.
    // Isso força uma re-renderização síncrona em qualquer componente que usa o hook.
    set({ user: null });
    console.log("🚪 Estado do usuário limpo. Redirecionamento deve ocorrer.");

    // Depois, executa a limpeza assíncrona com o Amplify em segundo plano.
    try {
      await amplifySignOut({ global: true });
      console.log("✅ Logout no Amplify concluído.");
    } catch (e) {
      console.warn("⚠️ Erro ao fazer signOut no Amplify:", e);
      // O estado local já foi limpo, então o usuário já foi deslogado da UI.
    }
  },
}));
