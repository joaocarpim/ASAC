import { create } from "zustand";
import { fetchAuthSession, signOut } from "aws-amplify/auth"; // ✅ v6 correto
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
      const session = await fetchAuthSession();

      if (!session || !session.tokens?.accessToken) {
        console.log("⚠️ Nenhum usuário logado");
        set({ user: null, isLoading: false });
        return;
      }

      // ✅ tokens no Amplify v6 vêm em session.tokens
      const { accessToken, idToken } = session.tokens;
      const payload = accessToken.payload;

      const sub = payload.sub as string;
      const username = payload["cognito:username"] as string;
      const email = idToken?.payload?.email as string | undefined;
      const cognitoGroups = payload["cognito:groups"];
      const isAdmin = Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins");

      const baseUser: User = {
        userId: sub,
        username,
        email: email || "",
        name: typeof username === "string" ? username : undefined,
        isAdmin,
      };

      if (!isAdmin) {
        // ✅ garante que o usuário exista no banco
        await ensureUserExistsInDB(baseUser.userId, baseUser.username, baseUser.email);
        const dbUser = await getUserById(baseUser.userId);
        set({ user: { ...baseUser, ...dbUser }, isLoading: false });
      } else {
        set({ user: baseUser, isLoading: false });
      }
    } catch (e) {
      console.error("❌ Erro checkUser:", e);
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
      console.warn("⚠️ refreshUserFromDB falhou:", e);
    }
  },

  updateUserData: (data) =>
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

  signOut: async () => {
    try {
      await signOut(); // ✅ v6 continua igual
      set({ user: null, isLoading: false });
    } catch (error) {
      console.log("Erro signOut:", error);
    }
  },
}));
