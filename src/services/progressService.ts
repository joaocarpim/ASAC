/* progressService.ts
   VERSÃO 4.1 (Com ensureUserExistsInDB, registerCorrect/Wrong e finishModule corrigidos)
*/
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";
// Importa as queries GERADAS
import {
  getUser,
  listUsers,
  listProgresses,
  getProgress,
} from "../graphql/queries";
import {
  updateUser as updateUserMutation,
  updateProgress as updateProgressMutation,
  createProgress as createProgressMutation,
  createAchievement as createAchievementMutation,
  createUser as createUserMutation, // ✅ ADICIONADO
} from "../graphql/mutations";

Amplify.configure(awsconfig);
const client = generateClient();

export type ErrorDetail = {
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

// =========================================
// === Funções de Ajuda (Helpers) ===
// =========================================

function normalizeErrorDetails(value: any): ErrorDetail[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [];
    }
  }
  return [value];
}

function stringifyErrorDetails(value: any): string {
  if (!value) return "[]";
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "[]";
  }
}

// =========================================
// === Funções de Serviço (Exportadas) ===
// =========================================

export const getUserById = async (userId: string) => {
  if (!userId) throw new Error("ID do usuário é obrigatório");
  console.log(`[progressService] 🔍 getUserById chamado para: ${userId}`);
  try {
    console.log(
      `[progressService] 🔐 Usando autenticação Cognito (userPool) para GetUser`
    );
    const result: any = await client.graphql({
      query: getUser,
      variables: { id: userId },
      authMode: "userPool",
    });
    const user = result.data?.getUser;
    if (user) {
      console.log(
        `[progressService] ✅ getUserById (userPool) encontrou: ${user.name}`
      );
      return user;
    }

    console.warn(
      "[progressService] ⚠️ userPool retornou null, tentando apiKey..."
    );
    const apiKeyResult: any = await client.graphql({
      query: getUser,
      variables: { id: userId },
      authMode: "apiKey",
    });
    const publicUser = apiKeyResult.data?.getUser;
    if (publicUser) {
      console.log(
        `[progressService] ✅ getUserById (apiKey) encontrou: ${publicUser.name}`
      );
      return publicUser;
    }
    console.log(
      `[progressService] ❌ getUserById não encontrou o usuário: ${userId}`
    );
    return null;
  } catch (error: any) {
    console.error(`[progressService] ❌ Erro no getUserById: ${error.message}`);
    try {
      const apiKeyResult: any = await client.graphql({
        query: getUser,
        variables: { id: userId },
        authMode: "apiKey",
      });
      if (apiKeyResult.data?.getUser) {
        console.log(
          `[progressService] ✅ getUserById (apiKey fallback) encontrou: ${apiKeyResult.data.getUser.name}`
        );
        return apiKeyResult.data.getUser;
      }
    } catch (apiKeyError: any) {
      console.error(
        "[progressService] ❌ Erro no GetUser (apiKey fallback):",
        apiKeyError.message
      );
    }
    console.log(
      `[progressService] ❌ getUserById não encontrou o usuário após erro: ${userId}`
    );
    return null;
  }
};

// ✅ NOVA FUNÇÃO: Cria usuário no DynamoDB
export const createUserInDB = async (
  userId: string,
  email: string,
  username?: string,
  name?: string
) => {
  console.log(`[progressService] 🆕 Criando usuário no DynamoDB:`, {
    userId,
    email,
    username,
  });

  try {
    const input = {
      id: userId, // ✅ Campo 'id' (não 'userId')
      email,
      username: username || email.split("@")[0],
      name: name || username || email.split("@")[0],
      role: "user", // ✅ ADICIONADO: Campo obrigatório
      coins: 0,
      points: 0,
      precision: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      modulesCompleted: [],
      currentModule: 1,
      timeSpent: 0,
    };

    const result: any = await client.graphql({
      query: createUserMutation,
      variables: { input },
      authMode: "userPool",
    });

    console.log(
      `[progressService] ✅ Usuário criado com sucesso:`,
      result.data.createUser
    );
    return result.data.createUser;
  } catch (error: any) {
    console.error(
      `[progressService] ❌ Erro ao criar usuário ${userId}:`,
      error.message
    );
    throw error;
  }
};

// ✅ NOVA FUNÇÃO: Garante que usuário existe no DynamoDB
export const ensureUserExistsInDB = async (
  userId: string,
  email?: string,
  username?: string,
  name?: string
) => {
  console.log(`[progressService] 🔍 ensureUserExistsInDB para: ${userId}`);

  try {
    // 1. Tentar buscar usuário existente
    const existingUser = await getUserById(userId);

    if (existingUser) {
      console.log(`[progressService] ✅ Usuário já existe no banco`);
      return existingUser;
    }

    // 2. Se não existe, criar
    console.log(`[progressService] 🆕 Usuário não existe, criando...`);

    if (!email) {
      throw new Error("Email é necessário para criar um novo usuário");
    }

    const newUser = await createUserInDB(userId, email, username, name);
    return newUser;
  } catch (error: any) {
    console.error(
      `[progressService] ❌ Erro em ensureUserExistsInDB:`,
      error.message
    );
    throw error;
  }
};

export const getModuleProgressByUser = async (
  userId: string,
  moduleId: string | number
) => {
  const mid = String(moduleId);
  console.log(`📊 Buscando progresso para user ${userId}, module ${mid}`);
  try {
    const result: any = await client.graphql({
      query: listProgresses,
      variables: { filter: { userId: { eq: userId }, moduleId: { eq: mid } } },
      authMode: "userPool",
    });
    const progressList = result?.data?.listProgresses?.items || [];
    const remoteProgress = progressList[0];
    if (remoteProgress) {
      remoteProgress.errorDetails = normalizeErrorDetails(
        remoteProgress.errorDetails
      );
      return remoteProgress;
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar getModuleProgressByUser:", error);
    return null;
  }
};

/**
 * Busca um ÚNICO registro de progresso pelo seu ID
 */
export const getProgressById = async (progressId: string) => {
  try {
    const result: any = await client.graphql({
      query: getProgress,
      variables: { id: progressId },
      authMode: "userPool",
    });
    const progress = result.data?.getProgress;
    if (progress) {
      progress.errorDetails = normalizeErrorDetails(progress.errorDetails);
    }
    return progress;
  } catch (error) {
    console.error("❌ Erro ao buscar getProgressById:", error);
    return null;
  }
};

export const ensureModuleProgress = async (
  userId: string,
  moduleId: string | number,
  moduleNumber?: number
) => {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) {
    console.log("✅ Progresso encontrado no GraphQL");
    return existing;
  }
  console.log("⚠️ Progresso não encontrado, criando...");
  const mid = String(moduleId);
  const computedModuleNumber = (moduleNumber ?? Number(mid)) || 0;
  const input = {
    userId,
    moduleId: mid,
    moduleNumber: computedModuleNumber,
    accuracy: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeSpent: 0,
    completed: false,
    completedAt: null,
    errorDetails: "[]",
  };
  try {
    const result: any = await client.graphql({
      query: createProgressMutation,
      variables: { input },
      authMode: "userPool",
    });
    const newProgress = result.data?.createProgress;
    if (newProgress) {
      console.log("✅ Progresso criado no GraphQL");
      newProgress.errorDetails = normalizeErrorDetails(
        newProgress.errorDetails
      );
      return newProgress;
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao criar createModuleProgress:", error);
    return null;
  }
};

export const updateModuleProgress = async (input: {
  id: string;
  accuracy?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  timeSpent?: number;
  completed?: boolean;
  completedAt?: string;
  errorDetails?: ErrorDetail[] | string;
}) => {
  const gqlInput: any = { ...input };
  if (gqlInput.errorDetails) {
    gqlInput.errorDetails = stringifyErrorDetails(gqlInput.errorDetails);
  }
  try {
    const result: any = await client.graphql({
      query: updateProgressMutation,
      variables: { input: gqlInput },
      authMode: "userPool",
    });
    console.log("✅ Progress atualizado no GraphQL");
    return result.data?.updateProgress;
  } catch (error) {
    console.warn("⚠️ Falha ao atualizar progress:", error);
    return null;
  }
};

export const updateUser = async (input: {
  id: string;
  coins?: number;
  points?: number;
  modulesCompleted?: number[];
  currentModule?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  timeSpent?: number;
  precision?: number;
}) => {
  console.log("💾 Atualizando usuário:", input);
  try {
    const result: any = await client.graphql({
      query: updateUserMutation,
      variables: { input },
      authMode: "userPool",
    });
    console.log("✅ Usuário atualizado no GraphQL");
    return result.data?.updateUser;
  } catch (error) {
    console.error("❌ Erro ao atualizar updateUser:", error);
    return null;
  }
};

export const registerCorrect = async (progressId: string) => {
  try {
    const progress = await getProgressById(progressId);
    if (!progress)
      throw new Error("Progresso não encontrado para registrar acerto");

    const newCorrectCount = (progress.correctAnswers ?? 0) + 1;

    await updateModuleProgress({
      id: progressId,
      correctAnswers: newCorrectCount,
    });
    console.log(
      `[progressService] ✅ Acerto registrado. Total: ${newCorrectCount}`
    );
  } catch (error) {
    console.warn("⚠️ Falha ao registrar acerto:", error);
  }
};

export const registerWrong = async (
  progressId: string,
  errorDetail: ErrorDetail
) => {
  try {
    const progress = await getProgressById(progressId);
    if (!progress)
      throw new Error("Progresso não encontrado para registrar erro");

    const newWrongCount = (progress.wrongAnswers ?? 0) + 1;
    const existingErrors = normalizeErrorDetails(progress.errorDetails);
    const newErrorDetails = [...existingErrors, errorDetail];

    await updateModuleProgress({
      id: progressId,
      wrongAnswers: newWrongCount,
      errorDetails: newErrorDetails,
    });
    console.log(
      `[progressService] ❌ Erro registrado. Total: ${newWrongCount}`
    );
  } catch (error) {
    console.warn("⚠️ Falha ao registrar erro:", error);
  }
};

export const finishModule = async (
  userId: string,
  progressId: string,
  moduleNumber: number,
  timeSpent: number,
  achievementTitle: string,
  coinsEarned = 150,
  correctCount = 0,
  wrongCount = 0,
  errorDetails: ErrorDetail[] = []
) => {
  try {
    console.log("🎯 finishModule chamado");

    const user = await getUserById(userId);
    if (!user) throw new Error("Usuário não encontrado");
    console.log("👤 Dados atuais do usuário:", user);

    const totalAnswered = correctCount + wrongCount;
    const accuracyNow =
      totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    console.log("📊 Atualizando progresso final do módulo...");
    await updateModuleProgress({
      id: progressId,
      completed: true,
      timeSpent,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: accuracyNow, // ✅ Salva a precisão DESTE módulo
      completedAt: new Date().toISOString(),
      errorDetails: errorDetails,
    });

    // Calcula os totais GERAIS (acumulados)
    const totalCorrect = (user.correctAnswers ?? 0) + correctCount;
    const totalWrong = (user.wrongAnswers ?? 0) + wrongCount;
    const totalAnswers = totalCorrect + totalWrong;
    const newPrecision = // Precisão GERAL
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const totalTimeSpent = (user.timeSpent ?? 0) + timeSpent;

    const updatedModules = Array.from(
      new Set([...(user.modulesCompleted ?? []), moduleNumber])
    ).sort((a: number, b: number) => a - b);

    const newPoints = (user.points ?? 0) + 12250;
    const newCoins = (user.coins ?? 0) + coinsEarned;

    console.log("📊 Novos valores GERAIS:", {
      newPoints,
      newCoins,
      totalCorrect,
      totalWrong,
    });

    // ✅ Envia todos os totais para a tabela User
    const updatePayload = {
      id: userId,
      modulesCompleted: updatedModules,
      precision: newPrecision,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: totalTimeSpent,
      coins: newCoins,
      points: newPoints,
      currentModule: Math.min(moduleNumber + 1, 99),
    };

    const updateResult = await updateUser(updatePayload);

    // ✅ Cria a conquista se passou (70%+)
    if (accuracyNow >= 70) {
      try {
        await createAchievement(userId, achievementTitle, moduleNumber);
      } catch (err) {
        console.warn("⚠️ Erro ao criar achievement:", err);
      }
    }

    console.log("✅ Módulo finalizado com sucesso!");
    return { accuracy: accuracyNow, updateResult, newPoints, newCoins };
  } catch (err) {
    console.error("❌ Erro em finishModule:", err);
    throw err;
  }
};

export const createAchievement = async (
  userId: string,
  title: string,
  moduleNumber?: number
) => {
  const input = {
    userId,
    title,
    moduleNumber: moduleNumber ?? null,
    description: title,
  };
  try {
    const result: any = await client.graphql({
      query: createAchievementMutation,
      variables: { input },
      authMode: "userPool",
    });
    console.log("🏅 Achievement criado");
    return result.data?.createAchievement;
  } catch (error) {
    console.error("❌ Erro ao criar createAchievement:", error);
    return null;
  }
};

export const getAllUsers = async () => {
  console.log("📊 Buscando todos os usuários...");
  try {
    const result: any = await client.graphql({
      query: listUsers,
      authMode: "userPool",
    });
    const users = result.data?.listUsers?.items || [];
    console.log(`✅ ${users.length} usuários encontrados.`);
    return users;
  } catch (error) {
    console.error("❌ Erro ao buscar getAllUsers:", error);
    return [];
  }
};

export default {
  getUserById,
  ensureModuleProgress,
  updateModuleProgress,
  updateUser,
  finishModule,
  createAchievement,
  getAllUsers,
  getModuleProgressByUser,
  registerCorrect,
  registerWrong,
  ensureUserExistsInDB,
  createUserInDB,
};
