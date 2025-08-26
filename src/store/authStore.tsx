// src/store/authStore.tsx

import { create } from "zustand";
import { fetchAuthSession } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
// <<-- CORREÇÃO: Removido 'listUsers' que não estava sendo usado.
import { getUser } from "../graphql/queries";
import { createUser } from "../graphql/mutations";

// Define o formato do nosso objeto de usuário que ficará no estado global
export type User = {
  userId: string;
  username: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  coins?: number;
  points?: number;
  modulesCompleted?: string;
  precision?: string;
  correctAnswers?: number;
  timeSpent?: string;
};

// Define o formato completo do nosso "store"
type AuthState = {
  user: User | null;
  isLoading: boolean;
  checkUser: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;
  logout: () => void;
  // <<-- CORREÇÃO PRINCIPAL: Adicionada a declaração da função que faltava.
  fetchUserFromDB: (
    userId: string,
    email: string,
    username: string
  ) => Promise<void>;
};

// Cria o store com o Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  checkUser: async () => {
    console.log("🔍 AuthStore: Verificando usuário...");
    try {
      // Primeiro verifica se há uma sessão válida
      const { tokens } = await fetchAuthSession();

      if (!tokens) {
        console.log("❌ AuthStore: Sem tokens válidos");
        set({ user: null, isLoading: false });
        return;
      }

      // <<-- CORREÇÃO: Removida a chamada a 'getCurrentUser' que não era utilizada.
      const { sub, username, email } = tokens.accessToken.payload;
      const cognitoGroups = tokens.accessToken.payload["cognito:groups"];
      const isAdmin =
        Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins");

      console.log("✅ AuthStore: Usuário autenticado:", {
        username,
        email,
        isAdmin,
      });

      // Se for admin, só precisa dos dados básicos
      if (isAdmin) {
        set({
          user: {
            userId: sub as string,
            username: username as string,
            email: email as string,
            name: username as string,
            isAdmin: true,
          },
          isLoading: false,
        });
        return;
      }

      // Para usuários normais, tenta buscar dados completos do DynamoDB
      try {
        await get().fetchUserFromDB(
          sub as string,
          email as string,
          username as string
        );
      } catch (dbError) {
        console.log(
          "⚠️ AuthStore: Erro no DynamoDB, usando dados básicos:",
          dbError
        );
        // Se falhar, usa dados básicos do Cognito
        set({
          user: {
            userId: sub as string,
            username: username as string,
            email: email as string,
            name: username as string,
            isAdmin: false,
            coins: 0,
            points: 0,
            modulesCompleted: "0/3",
          },
          isLoading: false,
        });
      }
    } catch (error) {
      console.log("❌ AuthStore: Erro na verificação:", error);
      set({ user: null, isLoading: false });
    }
  },

  fetchUserFromDB: async (userId: string, email: string, username: string) => {
    console.log("🔍 AuthStore: Buscando no DynamoDB...");
    const client = generateClient();

    try {
      // Tenta buscar usuário por ID
      const result = await client.graphql({
        query: getUser,
        variables: { id: userId },
      });

      if (result.data.getUser) {
        console.log("✅ AuthStore: Usuário encontrado no DB");
        set({
          user: {
            userId: result.data.getUser.id,
            username: username,
            email: result.data.getUser.email,
            name: result.data.getUser.name || username,
            isAdmin: false,
            coins: result.data.getUser.coins || 0,
            points: result.data.getUser.points || 0,
            modulesCompleted: result.data.getUser.modulesCompleted || "0/3",
            precision: result.data.getUser.precision || "0%",
            correctAnswers: result.data.getUser.correctAnswers || 0,
            timeSpent: result.data.getUser.timeSpent || "0min",
          },
          isLoading: false,
        });
        return;
      }

      // Se não encontrou, tenta criar novo usuário
      console.log("🆕 AuthStore: Criando usuário no DB...");
      const newUser = await client.graphql({
        query: createUser,
        variables: {
          input: {
            id: userId,
            email: email,
            name: username,
            role: "student",
            coins: 0,
            points: 0,
            modulesCompleted: "0/3",
            precision: "0%",
            correctAnswers: 0,
            timeSpent: "0min",
          },
        },
      });

      if (newUser.data.createUser) {
        console.log("✅ AuthStore: Usuário criado no DB");
        set({
          user: {
            userId: newUser.data.createUser.id,
            username: username,
            email: newUser.data.createUser.email,
            name: newUser.data.createUser.name || username,
            isAdmin: false,
            coins: newUser.data.createUser.coins || 0,
            points: newUser.data.createUser.points || 0,
            modulesCompleted: newUser.data.createUser.modulesCompleted || "0/3",
          },
          isLoading: false,
        });
      }
    } catch (error) {
      console.log("❌ AuthStore: Erro no DynamoDB:", error);
      throw error; // Re-throw para ser tratado no checkUser
    }
  },

  updateUserData: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  logout: () => {
    console.log("🚪 AuthStore: Logout");
    set({ user: null, isLoading: false });
  },
}));
