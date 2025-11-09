import { create } from "zustand";
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth";
import { getUserById } from "../services/progressService";

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

  checkUser: async () => {
    try {
      const session = await fetchAuthSession();

      let idPayload: any = {};
      let accessPayload: any = {};

      if ((session as any)?.tokens?.idToken?.payload) {
        idPayload = (session as any).tokens.idToken.payload;
        accessPayload = (session as any).tokens.accessToken?.payload ?? {};
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

      const groups =
        ((accessPayload["cognito:groups"] ??
          idPayload["cognito:groups"] ??
          []) as string[]) ?? [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");

      if (!sub) {
        set({ user: null, isLoading: false });
        return;
      }

      console.log(
        `[authStore] Logado como ${email} (Admin: ${isAdmin}). Buscando no DB...`
      );

      let dbUser: any = null;
      try {
        // ✅ Simplesmente busca o usuário - não tenta criar automaticamente
        dbUser = await getUserById(sub);

        if (dbUser) {
          console.log(
            "✅ [authStore] Usuário encontrado no banco:",
            dbUser?.name
          );
        } else {
          console.warn("⚠️ [authStore] Usuário não encontrado no DynamoDB.");
          console.warn(
            "💡 [authStore] Por favor, crie o usuário manualmente no DynamoDB ou use a tela de registro de admin."
          );

          // Define usuário com dados mínimos do Cognito
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
      } catch (dbError: any) {
        console.warn(
          "⚠️ [authStore] Erro ao buscar usuário no banco:",
          dbError.message
        );

        // Se der erro, define com dados mínimos do Cognito
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

      // ✅ Parse modulesCompleted se vier como string
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

      // ✅ Parse achievements se necessário
      let parsedAchievements: any[] = [];
      if (dbUser.achievements?.items) {
        parsedAchievements = dbUser.achievements.items;
      } else if (Array.isArray(dbUser.achievements)) {
        parsedAchievements = dbUser.achievements;
      }

      set({
        user: {
          userId: sub,
          email: email,
          username: username,
          name: dbUser.name ?? usernameFromEmail,
          role: dbUser.role ?? (isAdmin ? "Admins" : "user"),
          isAdmin: isAdmin,
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
      if (!dbUser) return;

      // ✅ Parse modulesCompleted
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

      // ✅ Parse achievements
      let parsedAchievements: any[] = [];
      if (dbUser.achievements?.items) {
        parsedAchievements = dbUser.achievements.items;
      } else if (Array.isArray(dbUser.achievements)) {
        parsedAchievements = dbUser.achievements;
      }

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
    } catch (e: any) {
      console.warn("⚠️ Erro ao fazer signOut no Amplify:", e);
    }
  },
}));
