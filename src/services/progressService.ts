import { fetchAuthSession } from "aws-amplify/auth";
import awsmobile from "../aws-exports";

export type ErrorDetail = {
  questionNumber?: number;
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

async function getIdTokenFromSession(): Promise<string | null> {
  try {
    const session: any = await fetchAuthSession();
    if (session?.tokens?.idToken?.jwtToken) return session.tokens.idToken.jwtToken;
    if (session?.tokens?.idToken && typeof session.tokens.idToken === "string") return session.tokens.idToken;
    return null;
  } catch {
    return null;
  }
}

async function graphqlRequest<T = any>(query: any, variables: Record<string, any> = {}, context = ""): Promise<T | null> {
  try {
    const authType = awsmobile?.aws_appsync_authenticationType || "AMAZON_COGNITO_USER_POOLS";
    const url = awsmobile?.aws_appsync_graphqlEndpoint;
    const apiKey = awsmobile?.aws_appsync_apiKey;

    if (!url) {
      console.warn(`[graphqlRequest] AppSync endpoint não encontrado (${context})`);
      return null;
    }

    let q: string;
    if (typeof query === "string") q = query;
    else if ((query as any)?.loc?.source?.body) q = (query as any).loc.source.body;
    else q = JSON.stringify(query);

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (authType === "API_KEY") {
      if (apiKey) headers["x-api-key"] = apiKey;
    } else {
      const idToken = await getIdTokenFromSession();
      if (idToken) headers.Authorization = idToken.startsWith("Bearer ") ? idToken : `Bearer ${idToken}`;
      else if (apiKey) headers["x-api-key"] = apiKey;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: q, variables }),
    });

    if (!res.ok) {
      console.warn(`⚠️ GraphQL HTTP erro em ${context}:`, res.status);
      return null;
    }

    const json: any = await res.json();
    if (json.errors) {
      console.error(`❌ GraphQL erro em ${context}:`, JSON.stringify(json.errors));
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`❌ Erro graphqlRequest ${context}:`, err);
    return null;
  }
}

const localProgressStore = new Map<string, any>();
const localUserStore = new Map<string, any>();

export async function getUserById(userId: string) {
  // Primeiro tenta buscar do cache local
  const localUser = localUserStore.get(userId);
  if (localUser) {
    console.log("📦 Retornando usuário do cache local:", localUser);
    return localUser;
  }

  const QUERY = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
      achievements { items { id title createdAt moduleNumber } }
    }
  }`;
  const data = await graphqlRequest<any>(QUERY, { id: userId }, "GetUserById");
  
  if (data?.getUser) {
    localUserStore.set(userId, data.getUser);
    return data.getUser;
  }
  
  return localUser ?? null;
}

export async function createUserAsAdmin(userId: string, name: string, email: string) {
  const MUT = `mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
    }
  }`;
  
  const input = {
    id: userId,
    name,
    email,
    role: "user",
    coins: 0,
    points: 0,
    modulesCompleted: [],
    currentModule: 1,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeSpent: 0,
    precision: 0,
  };
  
  console.log("👤 Criando usuário com input:", input);
  
  const data = await graphqlRequest<any>(MUT, { input }, "CreateUserAsAdmin");
  
  if (!data?.createUser) {
    console.warn("⚠️ createUser não retornou dados, usando fallback local");
    const fallbackUser = { ...input };
    localUserStore.set(userId, fallbackUser);
    return fallbackUser;
  }
  
  console.log("✅ Usuário criado com sucesso:", data.createUser);
  localUserStore.set(userId, data.createUser);
  return data.createUser;
}

export async function ensureUserInDB(userId: string, name: string, email: string) {
  try {
    console.log(`🔍 Buscando usuário ${userId}...`);
    let user = await getUserById(userId);
    
    if (!user) {
      console.log("👤 Usuário não encontrado, criando...");
      user = await createUserAsAdmin(userId, name, email);
    } else {
      console.log("✅ Usuário encontrado:", user);
    }
    
    return user;
  } catch (error: any) {
    console.error("❌ Erro ao buscar/criar usuário:", error);
    
    const isAuthError = 
      error?.message?.includes("Not Authorized") || 
      error?.message?.includes("Unauthorized") ||
      error?.errors?.some((e: any) => e.errorType === "Unauthorized");
    
    if (isAuthError) {
      console.log("🔧 Erro de autorização, usando fallback local");
      const fallbackUser = {
        id: userId,
        name,
        email,
        role: "user",
        coins: 0,
        points: 0,
        modulesCompleted: [],
        currentModule: 1,
        correctAnswers: 0,
        wrongAnswers: 0,
        timeSpent: 0,
        precision: 0,
      };
      localUserStore.set(userId, fallbackUser);
      return fallbackUser;
    }
    
    throw error;
  }
}

export async function ensureUserExistsInDB(userId: string) {
  try {
    console.log(`🔍 Verificando usuário ${userId} no banco...`);
    
    const existing = await getUserById(userId);
    
    if (existing) {
      console.log("✅ Usuário encontrado:", existing);
      return existing;
    }
    
    console.log("⚠️ Usuário não encontrado, tentando criar...");
    
    const session: any = await fetchAuthSession();
    const idToken = session?.tokens?.idToken;
    
    const email = idToken?.payload?.email || `user-${userId}@temp.com`;
    const name = idToken?.payload?.name || email.split("@")[0];
    
    console.log(`📝 Criando usuário com: email=${email}, name=${name}`);
    
    const created = await createUserAsAdmin(userId, name, email);
    
    if (created) {
      console.log("✅ Usuário criado com sucesso:", created);
      return created;
    }
    
    console.warn("⚠️ Falha ao criar usuário, retornando null");
    return null;
    
  } catch (error: any) {
    console.error("❌ Erro em ensureUserExistsInDB:", error);
    return null;
  }
}

function findLocalProgressById(id: string) {
  for (const [key, value] of localProgressStore.entries()) {
    if (value?.id === id) return { key, value };
  }
  return null;
}

function createLocalProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const mid = String(moduleId);
  const id = `local-${userId}-${mid}-${Date.now()}`;
  const computedModuleNumber = (moduleNumber ?? Number(mid)) || 0;
  const progress = {
    id,
    userId,
    moduleId: mid,
    moduleNumber: computedModuleNumber,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
    timeSpent: 0,
    completed: false,
    completedAt: null,
    errorDetails: [] as ErrorDetail[],
  };
  localProgressStore.set(`${userId}:${mid}`, progress);
  return progress;
}

export async function createAchievement(userId: string, title: string) {
  const MUT = `mutation CreateAchievement($input: CreateAchievementInput!) {
    createAchievement(input: $input) { id title createdAt userId moduleNumber }
  }`;

  const moduleMatch = title.match(/módulo\s+(\d+)/i);
  const moduleNumber = moduleMatch ? parseInt(moduleMatch[1]) : 1;

  const input = { userId, title, moduleNumber, description: title };
  const data = await graphqlRequest<any>(MUT, { input }, "CreateAchievement");
  
  if (data?.createAchievement) {
    return data.createAchievement;
  }
  return { id: `temp-${Date.now()}`, title, userId, moduleNumber, createdAt: new Date().toISOString() };
}

export async function getModuleProgressByUser(userId: string, moduleId: string | number) {
  const mid = String(moduleId);
  
  // Primeiro verifica cache local
  const localProg = localProgressStore.get(`${userId}:${mid}`);
  
  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails }
    }
  }`;
  const filter = { userId: { eq: userId }, moduleId: { eq: mid } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "ListProgresses");
  
  const remoteProgress = data?.listProgresses?.items?.[0];
  
  if (remoteProgress) {
    localProgressStore.set(`${userId}:${mid}`, remoteProgress);
    return remoteProgress;
  }
  
  return localProg ?? null;
}

export async function createModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const mid = String(moduleId);
  const MUT = `mutation CreateProgress($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;
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
    errorDetails: "[]",
  };
  const data = await graphqlRequest<any>(MUT, { input }, "CreateProgress");
  if (!data?.createProgress) {
    console.warn("⚠️ Falha ao criar progresso remoto, usando local");
    return createLocalProgress(userId, mid, input.moduleNumber);
  }
  const created = data.createProgress;
  localProgressStore.set(`${userId}:${mid}`, created);
  return created ?? null;
}

export async function ensureModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) return existing;
  return await createModuleProgress(userId, moduleId, moduleNumber);
}

async function updateModuleProgressRaw(input: any) {
  const MUT = `mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;
  
  const allowed = ["id", "accuracy", "correctAnswers", "wrongAnswers", "timeSpent", "completed", "completedAt", "errorDetails"];
  const filtered: any = {};
  for (const k of Object.keys(input || {})) {
    if (allowed.includes(k)) filtered[k] = input[k];
  }

  const data = await graphqlRequest<any>(MUT, { input: filtered }, "UpdateProgress");
  if (!data?.updateProgress) {
    console.warn("⚠️ Falha ao atualizar progresso remoto, atualizando local");
    const found = filtered?.id ? findLocalProgressById(filtered.id) : null;
    if (found) {
      const updated = { ...found.value, ...filtered };
      localProgressStore.set(found.key, updated);
      return updated;
    }
    return filtered;
  }
  const updated = data.updateProgress;
  if (updated?.userId && updated?.moduleId) {
    localProgressStore.set(`${updated.userId}:${String(updated.moduleId)}`, updated);
  }
  return updated ?? null;
}

async function updateUserRaw(input: any) {
  const MUT = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id name email role coins points modulesCompleted currentModule correctAnswers wrongAnswers timeSpent precision
    }
  }`;
  const allowed = ["id", "coins", "points", "modulesCompleted", "currentModule", "correctAnswers", "wrongAnswers", "timeSpent", "precision"];
  const filtered: any = {};
  for (const k of Object.keys(input || {})) {
    if (allowed.includes(k)) filtered[k] = input[k];
  }
  const data = await graphqlRequest<any>(MUT, { input: filtered }, "UpdateUser");
  if (!data?.updateUser) {
    console.warn("⚠️ Falha ao atualizar usuário remoto, atualizando local");
    const existing = localUserStore.get(input.id) || {};
    const updated = { ...existing, ...filtered };
    localUserStore.set(input.id, updated);
    return updated;
  }
  const updated = data.updateUser;
  if (updated?.id) localUserStore.set(updated.id, updated);
  return updated ?? null;
}

export async function finishModule(
  userId: string,
  progressId: string,
  moduleNumber: number,
  timeSpent: number,
  achievementTitle: string,
  coinsEarned: number = 150,
  correctCount: number = 0,
  wrongCount: number = 0
) {
  try {
    console.log("🎯 finishModule chamado com:", {
      userId,
      progressId,
      moduleNumber,
      correctCount,
      wrongCount,
      timeSpent,
      coinsEarned
    });
    
    let progressEntry = findLocalProgressById(progressId);
    if (!progressEntry) {
      const remote = await getModuleProgressByUser(userId, moduleNumber);
      const key = remote?.userId && remote?.moduleId ? `${remote.userId}:${String(remote.moduleId)}` : `${userId}:${moduleNumber}`;
      progressEntry = { key, value: remote ?? createLocalProgress(userId, String(moduleNumber), moduleNumber) };
    }

    const rawErrors = progressEntry.value?.errorDetails ?? [];
    const errorDetails = typeof rawErrors === "string" ? (() => { try { return JSON.parse(rawErrors); } catch { return []; } })() : rawErrors;
    const errorDetailsJSON = JSON.stringify(Array.isArray(errorDetails) ? errorDetails : []);

    const answeredNow = correctCount + wrongCount;
    const accuracyNow = answeredNow > 0 ? Math.round((correctCount / answeredNow) * 100) : 0;
    const completedAt = new Date().toISOString();

    console.log("📊 Atualizando progresso:", {
      id: progressEntry.value?.id,
      completed: true,
      timeSpent,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: accuracyNow,
      completedAt
    });

    if (progressEntry.value?.id) {
      await updateModuleProgressRaw({
        id: progressEntry.value.id,
        completed: true,
        timeSpent,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        accuracy: accuracyNow,
        completedAt,
        errorDetails: errorDetailsJSON,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      console.warn("⚠️ Usuário não encontrado ao finalizar módulo");
      // Mesmo sem usuário remoto, continua com dados locais
      const localUser = localUserStore.get(userId);
      if (!localUser) return null;
    }

    const currentUser = user || localUserStore.get(userId) || {};
    const newPoints = (currentUser.points || 0) + 12250;
    const newCoins = (currentUser.coins || 0) + coinsEarned;

    const currentCompleted = currentUser.modulesCompleted || [];
    const modulesCompleted = Array.isArray(currentCompleted) ? [...currentCompleted] : [];
    if (!modulesCompleted.includes(moduleNumber)) modulesCompleted.push(moduleNumber);

    const totalCorrect = (currentUser.correctAnswers || 0) + correctCount;
    const totalWrong = (currentUser.wrongAnswers || 0) + wrongCount;
    const totalTime = (currentUser.timeSpent || 0) + timeSpent;
    const totalAnswers = totalCorrect + totalWrong;
    const totalPrecision = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    console.log("📊 Atualizando usuário:", {
      id: userId,
      points: newPoints,
      coins: newCoins,
      modulesCompleted,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      precision: totalPrecision
    });

    const updateResult = await updateUserRaw({
      id: userId,
      points: newPoints,
      coins: newCoins,
      modulesCompleted,
      currentModule: Math.min(moduleNumber + 1, 99),
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: totalTime,
      precision: totalPrecision,
    });

    const achievement = await createAchievement(userId, achievementTitle);

    console.log("✅ Módulo finalizado com sucesso!");

    return {
      newPoints,
      newCoins,
      achievement,
      modulesCompleted,
      updateResult,
      progressId: progressEntry.value?.id,
      accuracy: accuracyNow,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      completedAt,
    };
  } catch (error) {
    console.error("❌ Erro ao finalizar módulo:", error);
    throw error;
  }
}

export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;
  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id moduleNumber completed }
    }
  }`;
  const data = await graphqlRequest<any>(QUERY, { filter: { userId: { eq: userId } } }, "CanStartModule");
  const items = data?.listProgresses?.items || [];
  const completed = items.filter((p: any) => p.completed === true);
  return completed.length >= moduleNumber - 1;
}

export async function registerCorrect(userId: string, progressId: string) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    const updated = { ...progress.value, correctAnswers: (progress.value.correctAnswers || 0) + 1 };
    localProgressStore.set(progress.key, updated);
  }
  return true;
}

export async function registerWrong(progressId: string, errorDetail: ErrorDetail) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    let errors = progress.value.errorDetails ?? [];
    if (typeof errors === "string") {
      try { errors = JSON.parse(errors); } catch { errors = []; }
    }
    errors = Array.isArray(errors) ? errors : [];
    errors.push(errorDetail);
    const updated = { ...progress.value, wrongAnswers: (progress.value.wrongAnswers || 0) + 1, errorDetails: errors };
    localProgressStore.set(progress.key, updated);
  }
  return true;
}

export async function getAllUsers() {
  const QUERY = `query ListUsers {
    listUsers {
      items {
        id name email coins points modulesCompleted currentModule
        correctAnswers wrongAnswers timeSpent precision
      }
    }
  }`;
  const data = await graphqlRequest<any>(QUERY, {}, "ListAllUsers");
  return data?.listUsers?.items ?? [];
}