import { create } from "zustand";
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
// ✅ Importa as funções corretas do progressService
import { getUserById, ensureUserExistsInDB } from "../services/progressService";

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
  wrongAnswers?: number | null;
  timeSpent?: number | null;
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

      // Normalizar sessão
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
      const emailStr =
        typeof rawEmail === "string" ? rawEmail : String(rawEmail ?? "");
      const usernameFromEmail = emailStr.includes("@")
        ? emailStr.split("@")[0]
        : emailStr;
      const username = String(
        idPayload["cognito:username"] ?? usernameFromEmail ?? ""
      );
      const email = String(emailStr ?? "");
      const name = String(idPayload.name ?? usernameFromEmail ?? "");

      // Verificar admin
      const groups =
        ((accessPayload["cognito:groups"] ??
          idPayload["cognito:groups"] ??
          []) as string[]) ?? [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      const baseUser: User = {
        userId: sub,
        username,
        email,
        name,
        isAdmin,
      };

      if (!sub) {
        set({ user: null, isLoading: false });
        return;
      }

      // ✅ CORREÇÃO: Usar ensureUserExistsInDB que cria se necessário
      console.log(
        `[authStore] Logado como ${email} (Admin: ${isAdmin}). Garantindo usuário no DB...`
      );

      let dbUser: any = null;
      try {
        // ✅ Garante que o usuário existe, criando se necessário
        dbUser = await ensureUserExistsInDB(sub, email, username, name);

        if (!dbUser) {
          console.error(
            `❌ [authStore] Falha ao garantir usuário no DynamoDB (ID: ${sub})`
          );
          // Usar apenas dados do Cognito como fallback
          set({ user: baseUser, isLoading: false });
          return;
        }

        console.log("✅ [authStore] Usuário garantido no banco:", dbUser?.name);
      } catch (dbError: any) {
        console.warn(
          "⚠️ [authStore] Erro ao garantir usuário no banco:",
          dbError.message
        );

        // ✅ Fallback: usar dados do Cognito e tentar criar em background
        set({ user: baseUser, isLoading: false });

        // Tentar criar em background sem bloquear
        ensureUserExistsInDB(sub, email, username, name).catch((e: Error) =>
          console.warn("⚠️ [authStore] Erro ao criar usuário em background:", e)
        );
        return;
      }

      // ✅ Sucesso: combinar dados do Cognito + DynamoDB
      set({
        user: {
          ...baseUser,
          ...dbUser,
          // Garantir que os dados do Cognito prevaleçam
          userId: sub,
          email: email,
          username: username,
          name: name,
          isAdmin: isAdmin,
          achievements: dbUser?.achievements?.items ?? [],
        },
        isLoading: false,
      });
    } catch (e: any) {
      console.warn(
        "⚠️ [authStore] Erro ao verificar usuário (não logado):",
        e.message
      );
      set({ user: null, isLoading: false });
    }
  },

  refreshUserFromDB: async () => {
    try {
      const u = get().user;
      if (!u) return;

      const dbUser = await getUserById(u.userId);

      if (dbUser) {
        set({
          user: {
            ...u,
            ...dbUser,
            achievements: dbUser?.achievements?.items ?? [],
          },
        });
      }
    } catch (e: any) {
      console.warn("⚠️ Erro ao atualizar dados do usuário:", e.message);
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
    } catch (e: any) {
      console.warn("⚠️ Erro ao fazer signOut no Amplify:", e.message);
    }
  },
}));
