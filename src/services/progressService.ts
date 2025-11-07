/* progressService.ts
   VERSÃO 2-B (BLOQUEADO) - CORRIGIDA
   Serviço de progresso / usuários com cache local + GraphQL (AppSync)
   - Compatível com Amplify v6
   - Usa fetchAuthSession do aws-amplify/auth
*/

import { fetchAuthSession } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";

/* -------------------------
   Tipos
------------------------- */
export type ErrorDetail = {
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

type AnyObject = Record<string, any>;

/* ===========================
   Local storage helpers
=========================== */
const STORAGE_KEYS = {
  USERS: "asac_local_users",
  PROGRESS: "asac_local_progress",
};

function saveToStorage(key: string, map: Map<string, any>) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const obj = Object.fromEntries(map);
      localStorage.setItem(key, JSON.stringify(obj));
      console.log(`💾 Salvou ${map.size} itens em ${key}`);
    }
  } catch (e) {
    console.warn("⚠️ Erro ao salvar no localStorage:", e);
  }
}

function loadFromStorage(key: string): Map<string, any> {
  const map = new Map<string, any>();
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const data = localStorage.getItem(key);
      if (data) {
        const obj = JSON.parse(data);
        Object.entries(obj).forEach(([k, v]) => map.set(k, v));
        console.log(`📦 Carregou ${map.size} itens de ${key}`);
      }
    }
  } catch (e) {
    console.warn("⚠️ Erro ao carregar do localStorage:", e);
  }
  return map;
}

const localUserStore = loadFromStorage(STORAGE_KEYS.USERS);
const localProgressStore = loadFromStorage(STORAGE_KEYS.PROGRESS);

console.log(
  `🚀 Stores inicializados: ${localUserStore.size} usuários, ${localProgressStore.size} progress`
);

/* ===========================
   Amplify config (v6)
=========================== */
Amplify.configure(awsconfig);

/* ===========================
   Auth / GraphQL helpers
=========================== */

/**
 * Tenta obter o idToken do session do Amplify v6.
 * Retorna string do JWT ou null.
 */
async function getIdTokenFromSession(): Promise<string | null> {
  try {
    const session: any = await fetchAuthSession();
    const idToken = session?.tokens?.idToken?.toString();
    return idToken ?? null;
  } catch (err) {
    return null;
  }
}

/**
 * graphqlRequest - Amplify v6 compatível
 */
async function graphqlRequest<T = any>(
  query: any,
  variables: Record<string, any> = {},
  context = ""
): Promise<T | null> {
  try {
    const url: string | undefined =
      (awsconfig && (awsconfig.aws_appsync_graphqlEndpoint as string)) ||
      process.env.APPSYNC_URL;
    const apiKey: string | undefined =
      awsconfig?.aws_appsync_apiKey || process.env.APPSYNC_API_KEY;

    if (!url) {
      console.warn(`[graphqlRequest] AppSync endpoint não encontrado (${context})`);
      return null;
    }

    const queryString =
      typeof query === "string"
        ? query
        : (query?.loc?.source?.body ?? JSON.stringify(query));

    const qLower = (queryString || "").trim().toLowerCase();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const idToken = await getIdTokenFromSession();

    if (!idToken && qLower.startsWith("mutation")) {
      console.debug(`[graphqlRequest] skip mutation (no Cognito token) — ${context}`);
      return null;
    }

    if (idToken) {
      headers["Authorization"] = idToken.startsWith("Bearer ") ? idToken : `Bearer ${idToken}`;
      console.log(`🔐 Usando autenticação Cognito para ${context}`);
    } else if (apiKey) {
      headers["x-api-key"] = apiKey;
      console.log(`🔑 Usando API Key para ${context}`);
    } else {
      console.warn(`[graphqlRequest] Sem token Cognito e sem API_KEY (${context}).`);
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: queryString, variables }),
    });

    if (!res.ok) {
      console.warn(`⚠️ GraphQL HTTP erro em ${context}:`, res.status);
      try {
        const text = await res.text();
        console.debug(`[graphqlRequest] response text (${context}):`, text);
      } catch {}
      return null;
    }

    const json: any = await res.json().catch(() => null);
    if (!json) {
      console.warn(`⚠️ GraphQL resposta vazia em ${context}`);
      return null;
    }
    if (json.errors) {
      console.warn(`⚠️ GraphQL erro em ${context}:`, json.errors.map((e: any) => e.message).join(", "));
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`❌ Erro graphqlRequest ${context}:`, err);
    return null;
  }
}

/* ===========================
   Utilities: tratar AWSJSON (errorDetails)
=========================== */

function normalizeErrorDetailsFromServer(value: any): ErrorDetail[] {
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

function stringifyErrorDetailsForServer(value: any): string {
  if (!value) return "[]";
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "[]";
  }
}

/* ===========================
   User functions
=========================== */

export async function getUserById(userId: string) {
  console.log("🔍 getUserById chamado para:", userId);
  
  const cachedUser = localUserStore.get(userId);
  const idToken = await getIdTokenFromSession();

  const QUERY_WITH_RELS = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
      achievements { items { id title description moduleNumber } }
      progress { items { id moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails } }
    }
  }`;

  const QUERY_NO_RELS = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
    }
  }`;

  const query = idToken ? QUERY_WITH_RELS : QUERY_NO_RELS;
  const data = await graphqlRequest<any>(query, { id: userId }, "GetUser");

  if (data?.getUser) {
    console.log("✅ Usuário encontrado no GraphQL");
    
    if (data.getUser.progress?.items) {
      data.getUser.progress.items = data.getUser.progress.items.map((p: any) => ({
        ...p,
        errorDetails: normalizeErrorDetailsFromServer(p.errorDetails),
      }));
    }

    if (cachedUser && (cachedUser.points ?? 0) > (data.getUser.points ?? 0)) {
      console.log("📦 Cache tem dados mais recentes");
      return cachedUser;
    }

    localUserStore.set(userId, data.getUser);
    saveToStorage(STORAGE_KEYS.USERS, localUserStore);
    return data.getUser;
  }

  if (cachedUser) {
    console.log("📦 Retornando usuário do cache");
    return cachedUser;
  }
  
  return null;
}

export async function createUserAsAdmin(userId: string, name: string, email: string) {
  const MUT = `mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role coins points modulesCompleted currentModule correctAnswers wrongAnswers timeSpent precision
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

  console.log("👤 Tentando criar usuário no GraphQL...");
  const data = await graphqlRequest<any>(MUT, { input }, "CreateUserAsAdmin");
  if (data?.createUser) {
    console.log("✅ Usuário criado no GraphQL");
    localUserStore.set(userId, data.createUser);
    saveToStorage(STORAGE_KEYS.USERS, localUserStore);
    return data.createUser;
  }

  console.log("📦 GraphQL falhou, criando apenas no cache local");
  localUserStore.set(userId, input);
  saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  return input;
}

export async function ensureUserInDB(userId: string, name: string, email: string) {
  let user = await getUserById(userId);
  if (!user) {
    console.log(`⚠️ Usuário ${userId} não existe. Criando...`);
    user = await createUserAsAdmin(userId, name, email);
  }
  return user;
}

export async function ensureUserExistsInDB(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    console.warn(`Usuário ${userId} não encontrado.`);
    return null;
  }
  return user;
}

/* ===========================
   Progress helpers
=========================== */
function findLocalProgressById(id: string) {
  for (const [key, value] of localProgressStore.entries()) {
    if (value?.id === id) return { key, value };
  }
  return null;
}

function createLocalProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const mid = String(moduleId);
  const id = `progress-${userId}-${mid}`;
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
    startedAt: new Date().toISOString(),
    errorDetails: [] as ErrorDetail[],
  };
  localProgressStore.set(`${userId}:${mid}`, progress);
  saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
  return progress;
}

export async function getModuleProgressByUser(userId: string, moduleId: string | number) {
  const mid = String(moduleId);

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    const localProg = localProgressStore.get(`${userId}:${mid}`);
    return localProg ?? null;
  }

  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails }
    }
  }`;
  const filter = { userId: { eq: userId }, moduleId: { eq: mid } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "ListProgresses");

  const remoteProgress = data?.listProgresses?.items?.[0];

  if (remoteProgress) {
    remoteProgress.errorDetails = normalizeErrorDetailsFromServer(remoteProgress.errorDetails);
    localProgressStore.set(`${userId}:${mid}`, remoteProgress);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
    return remoteProgress;
  }

  const localProg = localProgressStore.get(`${userId}:${mid}`);
  return localProg ?? null;
}

export async function createModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
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
    errorDetails: stringifyErrorDetailsForServer([]),
  };

  const localProg = createLocalProgress(userId, mid, input.moduleNumber);
  console.log("📦 Progress criado no cache local");

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    console.debug("createModuleProgress: sem token — pulando criação remota");
    return localProg;
  }

  const MUT_CREATE = `mutation CreateProgress($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT_CREATE, { input }, "CreateProgress")
    .then((data) => {
      if (data?.createProgress) {
        console.log("✅ Progress criado no GraphQL");
        const server = data.createProgress;
        server.errorDetails = normalizeErrorDetailsFromServer(server.errorDetails);
        localProgressStore.set(`${userId}:${mid}`, server);
        saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao criar progress:", err));

  return localProg;
}

export async function ensureModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  try {
    const mid = String(moduleId);
    const idToken = await getIdTokenFromSession();
    
    if (!idToken) {
      const localProg = localProgressStore.get(`${userId}:${mid}`);
      if (localProg) return localProg;
      return createLocalProgress(userId, mid, moduleNumber);
    }

    const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
      listProgresses(filter: $filter) {
        items {
          id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
        }
      }
    }`;

    const filter = { userId: { eq: userId }, moduleId: { eq: mid } };
    const data = await graphqlRequest<any>(QUERY, { filter }, "EnsureModuleProgress");

    const remoteProgress = data?.listProgresses?.items?.[0];

    if (remoteProgress) {
      remoteProgress.errorDetails = normalizeErrorDetailsFromServer(remoteProgress.errorDetails);
      localProgressStore.set(`${userId}:${mid}`, remoteProgress);
      saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      console.log("✅ Progresso encontrado no GraphQL");
      return remoteProgress;
    }

    console.log("⚠️ Progresso não encontrado, criando...");
    return await createModuleProgress(userId, moduleId, moduleNumber);

  } catch (err) {
    console.warn("⚠️ Erro em ensureModuleProgress:", err);
    const localProg = localProgressStore.get(`${userId}:${String(moduleId)}`);
    return localProg ?? createModuleProgress(userId, moduleId, moduleNumber);
  }
}

async function updateModuleProgressRaw(input: any) {
  const allowed = [
    "id",
    "accuracy",
    "correctAnswers",
    "wrongAnswers",
    "timeSpent",
    "completed",
    "completedAt",
    "errorDetails",
  ];
  const filtered: any = Object.fromEntries(
    Object.entries(input || {}).filter(([k]) => allowed.includes(k))
  );

  const found = filtered?.id ? findLocalProgressById(String(filtered.id)) : null;
  if (found) {
    const updated = { ...found.value, ...filtered };
    updated.errorDetails = normalizeErrorDetailsFromServer(updated.errorDetails);
    localProgressStore.set(found.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
    console.log("✅ Progress atualizado no cache local");
  }

  if (filtered.errorDetails) {
    filtered.errorDetails = stringifyErrorDetailsForServer(filtered.errorDetails);
  }

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    console.debug("updateModuleProgressRaw: sem token — pulando update remoto");
    return found?.value || filtered;
  }

  const MUT_UPDATE = `mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT_UPDATE, { input: filtered }, "UpdateProgress")
    .then((data) => {
      if (data?.updateProgress) {
        console.log("✅ Progress atualizado no GraphQL");
        const srv = data.updateProgress;
        srv.errorDetails = normalizeErrorDetailsFromServer(srv.errorDetails);
        localProgressStore.set(`${srv.userId}:${srv.moduleId}`, srv);
        saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao atualizar progress:", err));

  return found?.value || filtered;
}

async function updateUserRaw(input: any) {
  const allowed = [
    "id",
    "coins",
    "points",
    "modulesCompleted",
    "currentModule",
    "correctAnswers",
    "wrongAnswers",
    "timeSpent",
    "precision",
  ];
  const filtered: any = Object.fromEntries(
    Object.entries(input || {}).filter(([k]) => allowed.includes(k))
  );

  if (!filtered.id) {
    console.warn("updateUserRaw chamado sem id");
    return null;
  }

  console.log("💾 Atualizando usuário:", filtered);
  const existing = localUserStore.get(String(filtered.id)) || {};
  const updatedLocal = { ...existing, ...filtered };
  localUserStore.set(String(filtered.id), updatedLocal);
  saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  console.log("✅ Usuário atualizado no cache local");

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    console.debug("updateUserRaw: sem token — pulando update remoto");
    return updatedLocal;
  }

  const MUT_UPDATE_USER = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id name email role coins points modulesCompleted currentModule correctAnswers wrongAnswers timeSpent precision
    }
  }`;

  const data = await graphqlRequest<any>(MUT_UPDATE_USER, { input: filtered }, "UpdateUser");
  if (!data?.updateUser) {
    console.warn("updateUserRaw: falha no GraphQL, mantendo local");
    return updatedLocal;
  }
  
  const updatedServer = data.updateUser;
  if (updatedServer?.id) {
    localUserStore.set(updatedServer.id, updatedServer);
    saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  }
  return updatedServer ?? updatedLocal;
}

export async function finishModule(
  userId: string,
  progressId: string,
  moduleNumber: number,
  timeSpent: number,
  achievementTitle: string,
  coinsEarned = 150,
  correctCount = 0,
  wrongCount = 0
) {
  try {
    console.log("🎯 finishModule chamado");

    const user = await getUserById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    console.log("👤 Dados atuais do usuário:", user);

    const found = findLocalProgressById(progressId);
    if (!found) {
      createLocalProgress(userId, String(moduleNumber), moduleNumber);
    }

    const totalAnswered = correctCount + wrongCount;
    const accuracyNow = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    console.log("📊 Atualizando progresso do módulo...");
    await updateModuleProgressRaw({
      id: progressId,
      completed: true,
      timeSpent,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      accuracy: accuracyNow,
      completedAt: new Date().toISOString(),
    });

    const totalCorrect = (user.correctAnswers ?? 0) + correctCount;
    const totalWrong = (user.wrongAnswers ?? 0) + wrongCount;
    const totalAnswers = totalCorrect + totalWrong;
    const newPrecision = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    const updatedModules = Array.from(
      new Set([...(user.modulesCompleted ?? []), moduleNumber])
    ).sort((a: number, b: number) => a - b);

    const newPoints = (user.points ?? 0) + 12250;
    const newCoins = (user.coins ?? 0) + coinsEarned;

    console.log("📊 Novos valores:", { newPoints, newCoins, updatedModules });

    const updatePayload = {
      id: userId,
      modulesCompleted: updatedModules,
      precision: newPrecision,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: (user.timeSpent ?? 0) + timeSpent,
      coins: newCoins,
      points: newPoints,
      currentModule: Math.min(moduleNumber + 1, 99),
    };

    const updateResult = await updateUserRaw(updatePayload);

    if (accuracyNow >= 70) {
      try {
        const idToken = await getIdTokenFromSession();
        if (idToken) {
          await createAchievement(userId, achievementTitle, moduleNumber);
        }
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
}

export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    const cached = Array.from(localProgressStore.values()).filter(
      (p: any) => p.userId === userId && p.completed === true
    );
    const uniqueCompleted = Array.from(new Set(cached.map((p: any) => p.moduleNumber)));
    return uniqueCompleted.includes(moduleNumber - 1);
  }

  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { moduleNumber completed }
    }
  }`;

  const filter = { userId: { eq: userId } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "CanStartModule");
  const items: any[] = data?.listProgresses?.items || [];

  const cached = Array.from(localProgressStore.values()).filter(
    (p: any) => p.userId === userId
  );
  const combined = [...items, ...cached];

  const completedNumbers = combined
    .filter((p: any) => p.completed === true)
    .map((p: any) => p.moduleNumber);
  const uniqueCompleted = Array.from(new Set(completedNumbers));

  return uniqueCompleted.includes(moduleNumber - 1);
}

export async function registerCorrect(userId: string, progressId: string) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    const updated = {
      ...progress.value,
      correctAnswers: (progress.value.correctAnswers || 0) + 1,
    };
    localProgressStore.set(progress.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
    updateModuleProgressRaw({ id: progress.value.id, correctAnswers: updated.correctAnswers }).catch(() => {});
    return true;
  }
  return false;
}

export async function registerWrong(progressId: string, errorDetail: ErrorDetail) {
  const entry = findLocalProgressById(progressId);
  if (!entry) return false;

  let errors = entry.value.errorDetails;
  if (!Array.isArray(errors)) {
    try {
      errors = JSON.parse(errors || "[]");
    } catch {
      errors = [];
    }
  }

  errors = Array.isArray(errors) ? errors : [];
  errors.push(errorDetail);

  const updated = {
    ...entry.value,
    wrongAnswers: (entry.value.wrongAnswers ?? 0) + 1,
    errorDetails: errors,
  };
  localProgressStore.set(entry.key, updated);
  saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);

  updateModuleProgressRaw({
    id: entry.value.id,
    wrongAnswers: updated.wrongAnswers,
    errorDetails: stringifyErrorDetailsForServer(errors),
  }).catch(() => {});

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
  
  console.log("📊 Buscando todos os usuários...");
  const data = await graphqlRequest<any>(QUERY, {}, "ListAllUsers");
  
  if (data?.listUsers?.items) {
    console.log("✅ Usuários do GraphQL:", data.listUsers.items.length);
    const graphqlUsers = data.listUsers.items.map((u: any) => ({
      ...u,
      coins: u.coins ?? 0,
      points: u.points ?? 0,
      modulesCompleted: u.modulesCompleted ?? [],
      correctAnswers: u.correctAnswers ?? 0,
      wrongAnswers: u.wrongAnswers ?? 0,
      timeSpent: u.timeSpent ?? 0,
      precision: u.precision ?? 0,
    }));

    const allUsers = [...graphqlUsers];

    for (const [userId, cachedUser] of localUserStore.entries()) {
      const existsInGraphQL = graphqlUsers.some((u: any) => u.id === userId);
      if (!existsInGraphQL) {
        allUsers.push(cachedUser);
      } else {
        const graphqlUser = graphqlUsers.find((u: any) => u.id === userId);
        if ((cachedUser.points ?? 0) > (graphqlUser.points ?? 0)) {
          console.log("📦 Cache tem dados mais recentes para:", userId);
          const index = allUsers.findIndex((u: any) => u.id === userId);
          if (index >= 0) allUsers[index] = cachedUser;
        }
      }
    }

    console.log("✅ Total de usuários:", allUsers.length);
    return allUsers;
  }

  console.log("⚠️ Usando apenas cache local");
  return Array.from(localUserStore.values());
}

export async function createAchievement(userId: string, title: string, moduleNumber?: number) {
  const MUT = `mutation CreateAchievement($input: CreateAchievementInput!) {
    createAchievement(input: $input) { id title description moduleNumber userId createdAt }
  }`;

  const moduleFromTitle =
    typeof moduleNumber === "number"
      ? moduleNumber
      : (() => {
          const match = (title || "").match(/módulo\s+(\d+)/i);
          return match ? parseInt(match[1]) : undefined;
        })();

  const input = {
    userId,
    title,
    moduleNumber: moduleFromTitle ?? null,
    description: title,
  };

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    return {
      id: `temp-${Date.now()}`,
      title,
      userId,
      moduleNumber: moduleFromTitle ?? 0,
      createdAt: new Date().toISOString(),
      description: title,
    };
  }

  const data = await graphqlRequest<any>(MUT, { input }, "CreateAchievement");
  if (data?.createAchievement) {
    console.log("🏅 Achievement criado");
    return data.createAchievement;
  }

  return {
    id: `temp-${Date.now()}`,
    title,
    userId,
    moduleNumber: moduleFromTitle ?? 0,
    createdAt: new Date().toISOString(),
    description: title,
  };
}

export function getLocalUser(userId: string) {
  return localUserStore.get(userId) ?? null;
}

export function getLocalProgress(userId: string, moduleId: string | number) {
  const key = `${userId}:${String(moduleId)}`;
  return localProgressStore.get(key) ?? null;
}

export function clearLocalData() {
  console.warn("🧹 Limpando todos os dados locais...");
  localUserStore.clear();
  localProgressStore.clear();
  saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
  console.log("✅ Dados locais limpos");
}

export default {
  getUserById,
  createUserAsAdmin,
  ensureUserInDB,
  ensureUserExistsInDB,
  getModuleProgressByUser,
  createModuleProgress,
  ensureModuleProgress,
  updateModuleProgressRaw,
  updateUserRaw,
  finishModule,
  createAchievement,
  getAllUsers,
  getLocalUser,
  getLocalProgress,
  clearLocalData,
  registerCorrect,
  registerWrong,
  canStartModule,
};