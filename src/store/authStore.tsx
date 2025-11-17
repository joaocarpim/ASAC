// src/store/authStore.tsx

import { create } from "zustand";
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { getUserById } from "../services/progressService";
import { useModalStore } from "./useModalStore";

export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  role?: string;
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

  // =====================================================
  // 🔍 Verificar sessão atual (Cognito + DynamoDB)
  // =====================================================
  checkUser: async () => {
    try {
      // 👉 Pega a sessão atual (apenas tokens; o erro 400 do identity pool é “cosmético”)
      const session: any = await fetchAuthSession();

      let idPayload: any = {};
      let accessPayload: any = {};

      if (session?.tokens?.idToken?.payload) {
        idPayload = session.tokens.idToken.payload;
        accessPayload = session.tokens.accessToken?.payload ?? {};
      } else {
        // fallback para versões antigas / outras formas
        idPayload = session?.idToken ?? {};
        accessPayload = session?.accessToken ?? {};
      }

      // sub / username / email
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

      // grupos (Admins?)
      const groups =
        ((accessPayload["cognito:groups"] ??
          idPayload["cognito:groups"] ??
          []) as string[]) ?? [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      // Se não tem sub, considera não logado
      if (!sub) {
        set({ user: null, isLoading: false });
        return;
      }

      console.log(
        `[authStore] ✅ Sessão válida no Cognito para ${email} (Admin: ${isAdmin})`
      );
      console.log(
        `[authStore] 🔍 Buscando usuário correspondente no DynamoDB...`
      );

      let dbUser: any = null;

      try {
        // =====================================================
        // 🔎 Tenta buscar o usuário no DynamoDB (tabela User)
        // =====================================================
        dbUser = await getUserById(sub);

        if (!dbUser) {
          // 👉 Aqui é exatamente o caso em que o admin já deletou o user do Dynamo
          console.warn(
            "❌ [authStore] Usuário NÃO existe no DynamoDB. Considerando conta removida."
          );

          // Faz logout global do Cognito
          try {
            await amplifySignOut({ global: true });
          } catch (signOutError: any) {
            console.warn(
              "⚠️ [authStore] Erro ao fazer global signOut após conta removida:",
              signOutError?.message ?? signOutError
            );
          }

          set({ user: null, isLoading: false });

          // Mostra modal informando que a conta foi removida
          try {
            useModalStore
              .getState()
              .showModal(
                "Conta Removida",
                "Sua conta foi excluída pela administração. Se você acha que isso foi um engano, entre em contato com a equipe responsável.",
                false
              );
          } catch (modalError) {
            console.warn(
              "⚠️ [authStore] Não foi possível mostrar modal de conta removida:",
              modalError
            );
          }

          return;
        }

        console.log(
          "✅ [authStore] Usuário encontrado no DynamoDB:",
          dbUser?.name
        );
      } catch (dbError: any) {
        // Se der erro de rede / GraphQL / etc, não derruba o app
        console.warn(
          "⚠️ [authStore] Erro ao buscar usuário no DynamoDB:",
          dbError?.message ?? dbError
        );

        console.warn(
          "💡 [authStore] Usando dados apenas do Cognito temporariamente (busca falhou)"
        );
        set({
          user: {
            userId: sub,
            username,
            email,
            isAdmin,
            name: usernameFromEmail,
            role: isAdmin ? "Admins" : "user",
            coins: 0,
            points: 0,
            modulesCompleted: [],
            currentModule: 1,
            precision: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            timeSpent: 0,
          },
          isLoading: false,
        });
        return;
      }

      // =====================================================
      // 🔧 Parse de modulesCompleted
      // =====================================================
      let parsedModules: number[] = [];
      if (typeof dbUser.modulesCompleted === "string") {
        try {
          parsedModules = JSON.parse(dbUser.modulesCompleted);
        } catch {
          parsedModules = [];
        }
      } else if (Array.isArray(dbUser.modulesCompleted)) {
        parsedModules = dbUser.modulesCompleted;
      }

      // =====================================================
      // 🔧 Parse de achievements
      // =====================================================
      let parsedAchievements: any[] = [];
      if (dbUser.achievements?.items) {
        parsedAchievements = dbUser.achievements.items;
      } else if (Array.isArray(dbUser.achievements)) {
        parsedAchievements = dbUser.achievements;
      }

      console.log("✅ [authStore] Usuário configurado com sucesso!");

      // =====================================================
      // ✅ Monta o objeto final de usuário no store
      // =====================================================
      set({
        user: {
          userId: sub,
          email,
          username,
          name: dbUser.name ?? usernameFromEmail,
          role: dbUser.role ?? (isAdmin ? "Admins" : "user"),
          isAdmin,
          coins: dbUser.coins ?? 0,
          points: dbUser.points ?? 0,
          modulesCompleted: parsedModules,
          currentModule: dbUser.currentModule ?? 1,
          precision: dbUser.precision ?? 0,
          correctAnswers: dbUser.correctAnswers ?? 0,
          wrongAnswers: dbUser.wrongAnswers ?? 0,
          timeSpent: dbUser.timeSpent ?? 0,
          achievements: parsedAchievements,
        },
        isLoading: false,
      });
    } catch (e: any) {
      // Isso inclui casos como:
      // - usuário não logado
      // - token expirado
      // - identity pool não configurado (aquele 400/NotAuthorized que você vê no console)
      console.warn(
        "⚠️ [authStore] Usuário não autenticado ou sessão inválida:",
        e?.message ?? e
      );
      set({ user: null, isLoading: false });
    }
  },

  // =====================================================
  // 🔄 Recarregar dados do usuário direto do DynamoDB
  // =====================================================
  refreshUserFromDB: async () => {
    try {
      const u = get().user;
      if (!u) return;

      console.log(`[authStore] 🔄 Atualizando dados do usuário: ${u.email}`);

      const dbUser = await getUserById(u.userId);
      if (!dbUser) {
        console.warn("⚠️ [authStore] Usuário não encontrado no refresh");
        return;
      }

      // Parse modulesCompleted
      let parsedModules: number[] = [];
      if (typeof dbUser.modulesCompleted === "string") {
        try {
          parsedModules = JSON.parse(dbUser.modulesCompleted);
        } catch {
          parsedModules = [];
        }
      } else if (Array.isArray(dbUser.modulesCompleted)) {
        parsedModules = dbUser.modulesCompleted;
      }

      // Parse achievements
      let parsedAchievements: any[] = [];
      if (dbUser.achievements?.items) {
        parsedAchievements = dbUser.achievements.items;
      } else if (Array.isArray(dbUser.achievements)) {
        parsedAchievements = dbUser.achievements;
      }

      console.log("✅ [authStore] Dados do usuário atualizados com sucesso!");

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              ...dbUser,
              modulesCompleted: parsedModules,
              achievements: parsedAchievements,
            }
          : null,
      }));
    } catch (e: any) {
      console.warn(
        "⚠️ [authStore] Erro ao atualizar dados do usuário:",
        e?.message ?? e
      );
    }
  },

  // =====================================================
  // ✏️ Atualizar dados locais do usuário
  // =====================================================
  updateUserData: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  // =====================================================
  // 🚪 Logout
  // =====================================================
  signOut: async () => {
    console.log("[authStore] 🚪 Fazendo logout...");
    set({ user: null });
    try {
      await amplifySignOut({ global: true });
      console.log("[authStore] ✅ Logout realizado com sucesso");
    } catch (e: any) {
      console.warn(
        "⚠️ [authStore] Erro ao fazer signOut no Amplify:",
        e?.message ?? e
      );
    }
  },
}));
