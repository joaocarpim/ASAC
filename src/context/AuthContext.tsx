// ATENÇÃO: Este arquivo NÃO está sendo usado pelo seu App.tsx,
// mas se estiver, aqui está a versão corrigida
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser, fetchAuthSession, signOut } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { getUser, listUsers } from "../graphql/queries";
import { createUser } from "../graphql/mutations";
import { User as AppUser } from "../store/authStore"; // Reutiliza o tipo do authStore

// Tipos
// (Movido para authStore.ts para ser o tipo central)

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: AppUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => void;
}

// Criação do Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const client = generateClient();

  useEffect(() => {
    console.log("🚀 AuthProvider (NÃO USADO) inicializando...");
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Verificando estado de autenticação...");
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (cognitoUser && session.tokens) {
        console.log("✅ Usuário autenticado:", cognitoUser.username);
        await fetchUserFromDB(cognitoUser.userId, cognitoUser.username);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFromDB = async (userId: string, email: string) => {
    try {
      console.log("🔍 Buscando usuário no banco:", userId);
      const result: any = await client.graphql({
        query: getUser,
        variables: { id: userId },
        authMode: "userPool", // Importante
      });

      if (result.data.getUser) {
        console.log("✅ Usuário encontrado no banco:", result.data.getUser);
        const dbUser = result.data.getUser;
        setUser({
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          username: dbUser.email,
          isAdmin: dbUser.role === "Admins",
          coins: dbUser.coins,
          points: dbUser.points,
          modulesCompleted: dbUser.modulesCompleted,
          currentModule: dbUser.currentModule,
          precision: dbUser.precision,
          correctAnswers: dbUser.correctAnswers,
          timeSpent: dbUser.timeSpent,
          achievements: dbUser.achievements?.items ?? [],
        });
      } else {
        console.log("⚠️ Usuário não encontrado, buscando por email...");
        await searchUserByEmail(email, userId);
      }
    } catch (error) {
      console.log("❌ Erro ao buscar usuário no banco, criando novo:", error);
      await createUserInDB(userId, email);
    }
  };

  const searchUserByEmail = async (email: string, userId: string) => {
    try {
      const result: any = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } },
        authMode: "userPool",
      });

      const users = result.data.listUsers?.items || [];
      if (users.length > 0 && users[0]) {
        const dbUser = users[0];
        setUser({
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          username: dbUser.email,
          isAdmin: dbUser.role === "Admins",
          coins: dbUser.coins,
          points: dbUser.points,
          modulesCompleted: dbUser.modulesCompleted,
          currentModule: dbUser.currentModule,
          precision: dbUser.precision,
          correctAnswers: dbUser.correctAnswers,
          timeSpent: dbUser.timeSpent,
          achievements: dbUser.achievements?.items ?? [],
        });
      } else {
        console.log("⚠️ Usuário não encontrado por email, criando novo...");
        await createUserInDB(userId, email);
      }
    } catch (error) {
      console.log("❌ Erro ao buscar usuário por email:", error);
      await createUserInDB(userId, email);
    }
  };

  const createUserInDB = async (userId: string, email: string) => {
    try {
      console.log("🆕 Criando novo usuário no banco...");
      // ✅ CORREÇÃO COMPLETA: Todos os tipos corretos
      const newUserInput = {
        id: userId,
        email: email,
        name: email.split("@")[0],
        role: "user",
        coins: 0,
        points: 0,
        modulesCompleted: [], // ✅ Array vazio (tipo: [Int])
        currentModule: 1,
        precision: 0.0, // ✅ Number (tipo: Float)
        correctAnswers: 0,
        wrongAnswers: 0,
        timeSpent: 0.0, // ✅ Number (tipo: Float)
      };

      const newUser: any = await client.graphql({
        query: createUser,
        variables: { input: newUserInput },
        authMode: "userPool",
      });

      if (newUser.data.createUser) {
        const dbUser = newUser.data.createUser;
        setUser({
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          username: dbUser.email,
          isAdmin: dbUser.role === "Admins",
          coins: dbUser.coins,
          points: dbUser.points,
          modulesCompleted: dbUser.modulesCompleted,
          currentModule: dbUser.currentModule,
          precision: dbUser.precision,
          correctAnswers: dbUser.correctAnswers,
          timeSpent: dbUser.timeSpent,
          achievements: dbUser.achievements?.items ?? [],
        });
      }
    } catch (error) {
      console.log("❌ Erro ao criar usuário:", error);
    }
  };

  const login = (userData: AppUser) => {
    setUser(userData);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (user) {
      await fetchUserFromDB(user.userId, user.email);
    }
  };

  const updateUser = (userData: Partial<AppUser>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
