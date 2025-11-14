/* progressService.ts
    VERSÃO 7.1 - Sem aws-exports.js
*/
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
  createUser as createUserMutation,
} from "../graphql/mutations";

// ✅ 1. IMPORTAR O SUJEITO
import { moduleCompletionSubject } from "./ModuleCompletionSubject";

// NÃO precisa mais configurar Amplify aqui - já está configurado no App.tsx
const client = generateClient();

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

// =========================================
// === Funções de Ajuda ===
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
// === Funções de Serviço (sem alterações) ===
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
      id: userId,
      email,
      username: username || email.split("@")[0],
      name: name || username || email.split("@")[0],
      role: "user",
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
export const ensureUserExistsInDB = async (
  userId: string,
  email?: string,
  username?: string,
  name?: string
) => {
  console.log(`[progressService] 🔍 ensureUserExistsInDB para: ${userId}`);
  try {
    const existingUser = await getUserById(userId);
    if (existingUser) {
      console.log(`[progressService] ✅ Usuário já existe no banco`);
      return existingUser;
    }
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
    if (progressList.length === 0) {
      return null;
    }
    const sorted = progressList.sort((a: any, b: any) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    const mostRecent = sorted[0];
    mostRecent.errorDetails = normalizeErrorDetails(mostRecent.errorDetails);
    return mostRecent;
  } catch (error) {
    console.error("❌ Erro ao buscar getModuleProgressByUser:", error);
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
  console.log("⚠️ Criando novo registro de progresso para esta tentativa...");
  const mid = String(moduleId);
  const computedModuleNumber = (moduleNumber ?? Number(mid)) || 0;
  const input: any = {
    userId,
    moduleId: mid,
    moduleNumber: computedModuleNumber,
    accuracy: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeSpent: 0,
    completed: false,
  };
  try {
    console.log(
      "🔍 Criando progresso (mutation customizada):",
      JSON.stringify(input, null, 2)
    );
    const result: any = await client.graphql({
      query: CREATE_PROGRESS_SIMPLE,
      variables: { input },
      authMode: "userPool",
    });
    const newProgress = result.data?.createProgress;
    if (newProgress) {
      console.log("✅ Progresso criado com sucesso:", newProgress.id);
      newProgress.errorDetails = normalizeErrorDetails(
        newProgress.errorDetails
      );
      return newProgress;
    }
    console.error("❌ createProgress retornou null");
    return null;
  } catch (error: any) {
    console.error("❌ ERRO FATAL ao criar progresso:", error);
    if (error.errors) {
      console.error("📋 Detalhes dos erros GraphQL:");
      error.errors.forEach((err: any, idx: number) => {
        console.error(`  ${idx + 1}. ${err.message}`);
        if (err.path) console.error(`    Path: ${err.path.join(".")}`);
      });
    }
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
  if (gqlInput.errorDetails !== undefined) {
    if (
      Array.isArray(gqlInput.errorDetails) ||
      typeof gqlInput.errorDetails === "object"
    ) {
      gqlInput.errorDetails = stringifyErrorDetails(gqlInput.errorDetails);
    }
  }
  try {
    const result: any = await client.graphql({
      query: updateProgressMutation,
      variables: { input: gqlInput },
      authMode: "userPool",
    });
    console.log("✅ Progress atualizado no GraphQL");
    return result.data?.updateProgress;
  } catch (error: any) {
    console.warn("⚠️ Falha ao atualizar progress:", error);
    if (error.errors) {
      console.error("📋 Erros de atualização:");
      error.errors.forEach((err: any) => console.error(`  - ${err.message}`));
    }
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
    const hasError = existingErrors.some(
      (e) => e.questionId === errorDetail.questionId
    );
    const newErrorDetails = hasError
      ? existingErrors
      : [...existingErrors, errorDetail];
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
    console.error("❌ Erro ao buscar usuários:", error);
    return [];
  }
};
// =========================================
// === FUNÇÃO finishModule (MODIFICADA) ===
// =========================================
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

    const oldProgress = await getModuleProgressByUser(
      userId,
      String(moduleNumber)
    );
    let oldCorrect = 0;
    let oldWrong = 0;
    let oldTime = 0;

    if (oldProgress && oldProgress.id !== progressId) {
      oldCorrect = oldProgress.correctAnswers ?? 0;
      oldWrong = oldProgress.wrongAnswers ?? 0;
      oldTime = oldProgress.timeSpent ?? 0;
      console.log(
        `📊 Dados Antigos Módulo ${moduleNumber} (ID: ${oldProgress.id}): ${oldCorrect} acertos, ${oldWrong} erros, ${oldTime}s`
      );
    } else {
      console.log(
        `📊 Esta é a primeira tentativa registrada para o Módulo ${moduleNumber}`
      );
    }

    const totalAnswered = correctCount + wrongCount;
    const accuracyNow =
      totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const isCompleted = accuracyNow >= 70; // Sua lógica de 70%

    console.log(
      `📊 Atualizando progresso final do módulo (ID: ${progressId})...`
    );
    await updateModuleProgress({
      id: progressId,
      completed: isCompleted,
      timeSpent: timeSpent,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: accuracyNow,
      completedAt: new Date().toISOString(),
      errorDetails: errorDetails,
    });

    // ✅ 2. DISPARAR O EVENTO DO OBSERVER
    // Notifica os ouvintes (como o NotificationObserver) sobre o resultado.
    moduleCompletionSubject.notify({
      moduleId: progressId, // Você pode usar o ID do progresso ou o ID do módulo
      moduleNumber: moduleNumber,
      accuracy: accuracyNow,
      passed: isCompleted, // 'passed' é true se accuracy >= 70
    });

    const totalCorrect = (user.correctAnswers ?? 0) - oldCorrect + correctCount;
    const totalWrong = (user.wrongAnswers ?? 0) - oldWrong + wrongCount;
    const totalTimeSpent = (user.timeSpent ?? 0) - oldTime + timeSpent;
    const totalAnswers = totalCorrect + totalWrong;
    const newPrecision =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    let updatedModules: number[] = Array.isArray(user.modulesCompleted)
      ? user.modulesCompleted.filter(
          (n: number | null): n is number => typeof n === "number"
        )
      : [];
    if (isCompleted && !updatedModules.includes(moduleNumber)) {
      updatedModules.push(moduleNumber);
    }
    updatedModules = [...new Set(updatedModules)].sort(
      (a: number, b: number) => a - b
    );
    const newPoints = isCompleted
      ? (user.points ?? 0) + 12250
      : user.points ?? 0;
    const newCoins = isCompleted
      ? (user.coins ?? 0) + coinsEarned
      : user.coins ?? 0;

    console.log("📊 Novos valores GERAIS:", {
      newPoints,
      newCoins,
      totalCorrect,
      totalWrong,
      totalTimeSpent,
    });

    const updatePayload = {
      id: userId,
      modulesCompleted: updatedModules,
      precision: newPrecision,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: totalTimeSpent,
      coins: newCoins,
      points: newPoints,
      currentModule: Math.max(
        user.currentModule ?? 1,
        updatedModules.length + 1
      ),
    };

    const updateResult = await updateUser(updatePayload);
    if (isCompleted) {
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
