import { create } from "zustand";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { getUser } from "../graphql/queries";
import { createUser } from "../graphql/mutations";

// Define o formato completo do nosso objeto de usuário no estado global
export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: string | null;
  precision?: string | null;
  correctAnswers?: number | null;
  timeSpent?: string | null;
};

// Define o formato completo do nosso "store"
type AuthState = {
  user: User | null;
  isLoading: boolean;
  checkUser: () => Promise<void>;
  updateUserData: (data: Partial<Omit<User, "userId" | "isAdmin">>) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // App sempre começa em estado de carregamento

  checkUser: async () => {
    try {
      const { tokens } = await fetchAuthSession();
      if (!tokens) {
        set({ user: null, isLoading: false });
        return;
      }

      const { sub, username, email } = tokens.accessToken.payload;
      const cognitoGroups = tokens.accessToken.payload["cognito:groups"];
      const isAdmin =
        Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins");

      const baseUser = {
        userId: sub as string,
        username: username as string,
        email: email as string,
        isAdmin,
      };

      if (!isAdmin) {
        const client = generateClient();
        const result = await client.graphql({
          query: getUser,
          variables: { id: baseUser.userId },
        });

        if (result.data.getUser) {
          set({
            user: { ...baseUser, ...result.data.getUser },
            isLoading: false,
          });
        } else {
          const newUserInput = {
            id: baseUser.userId,
            email: baseUser.email,
            name: baseUser.username,
            role: "User",
            coins: 0,
            points: 0,
          };
          const newUserResult = await client.graphql({
            query: createUser,
            variables: { input: newUserInput },
          });
          set({
            user: { ...baseUser, ...newUserResult.data.createUser },
            isLoading: false,
          });
        }
      } else {
        set({ user: baseUser, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  updateUserData: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  signOut: async () => {
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      console.log("Erro ao fazer signOut no store:", error);
    }
  },
}));