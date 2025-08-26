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

// Tipos
export interface User {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  coins?: number;
  points?: number;
  modulesCompleted?: string;
  precision?: string;
  correctAnswers?: number;
  timeSpent?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Criação do Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const client = generateClient();

  // Verificar se há usuário autenticado no início
  useEffect(() => {
    console.log("🚀 AuthProvider inicializando...");
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Verificando estado de autenticação...");

      // Verificar se há usuário autenticado no Cognito
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (currentUser && session.tokens) {
        console.log("✅ Usuário autenticado encontrado:", currentUser.username);

        // Buscar dados do usuário no DynamoDB
        await fetchUserFromDB(currentUser.userId, currentUser.username);
      } else {
        console.log("❌ Nenhum usuário autenticado");
        setUser(null);
      }
    } catch (error) {
      console.log("ℹ️ Usuário não autenticado:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFromDB = async (userId: string, email: string) => {
    try {
      console.log("🔍 Buscando usuário no banco:", userId);

      // Primeiro tenta buscar pelo ID
      const result = await client.graphql({
        query: getUser,
        variables: { id: userId },
      });

      if (result.data.getUser) {
        console.log("✅ Usuário encontrado no banco:", result.data.getUser);
        setUser({
          userId: result.data.getUser.id,
          email: result.data.getUser.email,
          name: result.data.getUser.name,
          role: result.data.getUser.role,
          
        });
      } else {
        console.log(
          "⚠️ Usuário não encontrado no banco, buscando por email..."
        );
        await searchUserByEmail(email, userId);
      }
    } catch (error) {
      console.log("❌ Erro ao buscar usuário no banco:", error);
      // Se não encontrar no banco, criar um usuário básico
      await createUserInDB(userId, email);
    }
  };

  const searchUserByEmail = async (email: string, userId: string) => {
    try {
      const result = await client.graphql({
        query: listUsers,
        variables: {
          filter: { email: { eq: email } },
        },
      });

      const users = result.data.listUsers?.items || [];
      if (users.length > 0 && users[0]) {
        console.log("✅ Usuário encontrado por email:", users[0]);
        setUser({
          userId: users[0].id,
          email: users[0].email,
          name: users[0].name,
          role: users[0].role,
          
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
      const newUser = await client.graphql({
        query: createUser,
        variables: {
          input: {
            id: userId,
            email: email,
            name: email.split("@")[0], // Nome baseado no email
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
        console.log("✅ Usuário criado com sucesso:", newUser.data.createUser);
        setUser({
          userId: newUser.data.createUser.id,
          email: newUser.data.createUser.email,
          name: newUser.data.createUser.name,
          role: newUser.data.createUser.role,
          
        });
      }
    } catch (error) {
      console.log("❌ Erro ao criar usuário:", error);
      // Em caso de erro, criar um usuário temporário
      setUser({
        userId,
        email,
        name: email.split("@")[0],
        role: "student",
        coins: 0,
        points: 0,
        modulesCompleted: "0/3",
        precision: "0%",
        correctAnswers: 0,
        timeSpent: "0min",
      });
    }
  };

  const login = (userData: User) => {
    console.log("🔑 Login realizado via contexto:", userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      console.log("🚪 Realizando logout...");
      await signOut();
      setUser(null);
      console.log("✅ Logout realizado com sucesso");
    } catch (error) {
      console.log("❌ Erro no logout:", error);
      setUser(null); // Limpar mesmo com erro
    }
  };

  const refreshUser = async () => {
    if (user) {
      console.log("🔄 Atualizando dados do usuário...");
      await fetchUserFromDB(user.userId, user.email);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      console.log("📝 Atualizando dados locais do usuário:", userData);
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
