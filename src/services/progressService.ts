// src/services/progressService.ts
// VERSÃO 7.5 - Corrigido limite de busca e queries

import { generateClient } from "aws-amplify/api";
import {
  getUser,
  listUsers,
  listProgresses,
  getProgress,
} from "../graphql/queries";
import {
  updateUser as updateUserMutation,
  updateProgress as updateProgressMutation,
  createAchievement as createAchievementMutation,
} from "../graphql/mutations";

// Importa o Sujeito
import { moduleCompletionSubject } from "./ModuleCompletionSubject";

const client = generateClient();

// ✅ Mutation para criar usuário diretamente no DynamoDB
const CREATE_USER_MUTATION = /* GraphQL */ `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      role
      coins
      points
      modulesCompleted
      currentModule
      precision
      correctAnswers
      wrongAnswers
      timeSpent
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PROGRESS_SIMPLE = /* GraphQL */ `
  mutation CreateProgressSimple($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id
      userId
      moduleId
      moduleNumber
      accuracy
      correctAnswers
      wrongAnswers
      timeSpent
      completed
      completedAt
      errorDetails
      createdAt
      updatedAt
    }
  }
`;

export type ErrorDetail = {
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

// ---------------------------
// HELPERS
// ---------------------------

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

// ---------------------------
// SERVIÇOS
// ---------------------------

/**
 * Buscar usuário por ID
 */
export const getUserById = async (userId: string) => {
  if (!userId) throw new Error("ID do usuário é obrigatório");
  console.log(`[progressService] 🔍 getUserById chamado para: ${userId}`);

  try {
    const result: any = await client.graphql({
      query: getUser,
      variables: { id: userId },
      authMode: "userPool",
    });

    const user = result.data?.getUser;

    if (user) return user;

    // fallback API key
    const apiKeyRes: any = await client.graphql({
      query: getUser,
      variables: { id: userId },
      authMode: "apiKey",
    });

    return apiKeyRes.data?.getUser || null;
  } catch (error) {
    console.error("❌ getUserById error:", error);
    return null;
  }
};

/**
 * Cria usuário DIRETAMENTE no DynamoDB (sem tentar criar no Cognito)
 */
export const createUserInDB = async (
  userId: string,
  email: string,
  username?: string,
  name?: string
) => {
  console.log(
    "[progressService] 🆕 Criando usuário DIRETAMENTE no DynamoDB..."
  );
  console.log(`[progressService] UserID: ${userId}`);
  console.log(`[progressService] Email: ${email}`);

  try {
    const input = {
      id: userId, // Sub do Cognito
      email: email,
      name: name || username || email.split("@")[0],
      role: "user",
      coins: 0,
      points: 0,
      modulesCompleted: [], // Array vazio
      currentModule: 1,
      precision: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeSpent: 0,
    };

    console.log(
      "[progressService] Input para createUser:",
      JSON.stringify(input, null, 2)
    );

    const result: any = await client.graphql({
      query: CREATE_USER_MUTATION,
      variables: { input },
      authMode: "userPool",
    });

    console.log("✅ [progressService] createUser executado:", result);

    const createdUser = result.data?.createUser;

    if (createdUser) {
      console.log(
        "✅ [progressService] Usuário criado no DynamoDB com sucesso!"
      );
      return createdUser;
    } else {
      throw new Error("createUser não retornou dados");
    }
  } catch (error: any) {
    console.error(
      "❌ [progressService] Erro ao criar usuário no DynamoDB:",
      error
    );

    if (
      error.message?.includes("already exists") ||
      error.message?.includes("ConditionalCheckFailedException")
    ) {
      console.warn("⚠️ [progressService] Usuário já existe, buscando...");
      return await getUserById(userId);
    }

    throw error;
  }
};

/**
 * Garante que o usuário existe (busca → cria no DynamoDB se necessário)
 */
export const ensureUserExistsInDB = async (
  userId: string,
  email?: string,
  username?: string,
  name?: string
) => {
  console.log(`[progressService] 🔍 ensureUserExistsInDB para: ${userId}`);

  const existingUser = await getUserById(userId);

  if (existingUser) {
    console.log("✅ [progressService] Usuário já existe no DynamoDB");
    return existingUser;
  }

  if (!email) throw new Error("Email é necessário para criar usuário");

  console.log("🆕 [progressService] Criando usuário no DynamoDB...");
  return createUserInDB(userId, email, username, name);
};

// ================================
// 🔥 CORREÇÃO PRINCIPAL AQUI 🔥
// ================================
export const getModuleProgressByUser = async (
  userId: string,
  moduleId: string | number
) => {
  const mid = String(moduleId);

  try {
    const result: any = await client.graphql({
      query: listProgresses,
      variables: {
        filter: {
          userId: { eq: userId },
          moduleId: { eq: mid },
        },
        limit: 1000, // ✅ AUMENTADO: Garante que pegamos a tentativa mais recente mesmo se houver muitas
      },
      authMode: "userPool",
    });

    const list = result.data?.listProgresses?.items || [];
    if (list.length === 0) return null;

    // Ordena do mais recente para o mais antigo baseado na data de atualização
    const sorted = list.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );

    const progress = sorted[0]; // Pega o primeiro (o mais recente)
    progress.errorDetails = normalizeErrorDetails(progress.errorDetails);
    return progress;
  } catch (err) {
    console.error("❌ getModuleProgressByUser error:", err);
    return null;
  }
};

export const getProgressById = async (progressId: string) => {
  try {
    const result: any = await client.graphql({
      query: getProgress,
      variables: { id: progressId },
      authMode: "userPool",
    });

    const progress = result.data?.getProgress;
    if (progress)
      progress.errorDetails = normalizeErrorDetails(progress.errorDetails);

    return progress;
  } catch (err) {
    console.error("❌ getProgress error:", err);
    return null;
  }
};

export const ensureModuleProgress = async (
  userId: string,
  moduleId: string | number,
  moduleNumber?: number
) => {
  console.log("⚠️ Criando novo registro de progresso...");

  const mid = String(moduleId);
  const moduleNum = moduleNumber ?? Number(mid);

  const input: any = {
    userId,
    moduleId: mid,
    moduleNumber: moduleNum,
    accuracy: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeSpent: 0,
    completed: false,
  };

  try {
    const result: any = await client.graphql({
      query: CREATE_PROGRESS_SIMPLE,
      variables: { input },
      authMode: "userPool",
    });

    const created = result.data?.createProgress;
    if (!created) return null;

    created.errorDetails = normalizeErrorDetails(created.errorDetails);
    return created;
  } catch (err) {
    console.error("❌ ensureModuleProgress error:", err);
    return null;
  }
};

export const updateModuleProgress = async (input: any) => {
  const gqlInput = { ...input };

  if (gqlInput.errorDetails) {
    gqlInput.errorDetails = stringifyErrorDetails(gqlInput.errorDetails);
  }

  try {
    const result: any = await client.graphql({
      query: updateProgressMutation,
      variables: { input: gqlInput },
      authMode: "userPool",
    });

    return result.data?.updateProgress;
  } catch (err) {
    console.error("❌ updateModuleProgress error:", err);
    return null;
  }
};

export const updateUser = async (input: any) => {
  try {
    const result: any = await client.graphql({
      query: updateUserMutation,
      variables: { input },
      authMode: "userPool",
    });

    return result.data?.updateUser;
  } catch (err) {
    console.error("❌ updateUser error:", err);
    return null;
  }
};

export const registerCorrect = async (progressId: string) => {
  try {
    const progress = await getProgressById(progressId);
    if (!progress) return;

    await updateModuleProgress({
      id: progressId,
      correctAnswers: (progress.correctAnswers ?? 0) + 1,
    });
  } catch (err) {
    console.warn("⚠️ registerCorrect:", err);
  }
};

export const registerWrong = async (progressId: string, errDetail: any) => {
  try {
    const progress = await getProgressById(progressId);
    if (!progress) return;

    const existing = normalizeErrorDetails(progress.errorDetails);
    const updated = existing.some((e) => e.questionId === errDetail.questionId)
      ? existing
      : [...existing, errDetail];

    await updateModuleProgress({
      id: progressId,
      wrongAnswers: (progress.wrongAnswers ?? 0) + 1,
      errorDetails: updated,
    });
  } catch (err) {
    console.warn("⚠️ registerWrong:", err);
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

    return result.data?.createAchievement;
  } catch (err) {
    console.error("❌ createAchievement:", err);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const result: any = await client.graphql({
      query: listUsers,
      authMode: "userPool",
    });

    return result.data?.listUsers?.items || [];
  } catch (err) {
    console.error("❌ getAllUsers:", err);
    return [];
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
    const user = await getUserById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const oldProgress = await getModuleProgressByUser(userId, moduleNumber);

    let oldCorrect = 0;
    let oldWrong = 0;
    let oldTime = 0;

    if (oldProgress && oldProgress.id !== progressId) {
      oldCorrect = oldProgress.correctAnswers ?? 0;
      oldWrong = oldProgress.wrongAnswers ?? 0;
      oldTime = oldProgress.timeSpent ?? 0;
    }

    const totalNow = correctCount + wrongCount;
    const accuracyNow =
      totalNow > 0 ? Math.round((correctCount / totalNow) * 100) : 0;
    const completed = accuracyNow >= 70;

    await updateModuleProgress({
      id: progressId,
      completed,
      timeSpent,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: accuracyNow,
      completedAt: new Date().toISOString(),
      errorDetails,
    });

    moduleCompletionSubject.notify({
      moduleId: progressId,
      moduleNumber,
      accuracy: accuracyNow,
      passed: completed,
    });

    const totalCorrect = (user.correctAnswers ?? 0) - oldCorrect + correctCount;
    const totalWrong = (user.wrongAnswers ?? 0) - oldWrong + wrongCount;
    const totalTime = (user.timeSpent ?? 0) - oldTime + timeSpent;
    const totalAnswered = totalCorrect + totalWrong;
    const precision =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    let modules = Array.isArray(user.modulesCompleted)
      ? [...user.modulesCompleted]
      : [];

    if (completed && !modules.includes(moduleNumber)) {
      modules.push(moduleNumber);
      modules = [...new Set(modules)].sort((a, b) => a - b);
    }

    const updatePayload = {
      id: userId,
      modulesCompleted: modules,
      precision,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: totalTime,
      coins: completed ? (user.coins ?? 0) + coinsEarned : user.coins,
      points: completed ? (user.points ?? 0) + 12250 : user.points,
      currentModule: Math.max(user.currentModule ?? 1, modules.length + 1),
    };

    const updateResult = await updateUser(updatePayload);

    if (completed) {
      await createAchievement(userId, achievementTitle, moduleNumber);
    }

    return {
      accuracy: accuracyNow,
      updateResult,
      newCoins: updatePayload.coins,
      newPoints: updatePayload.points,
    };
  } catch (err) {
    console.error("❌ finishModule:", err);
    throw err;
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
