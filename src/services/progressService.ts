/* progressService.ts
   Serviço de progresso / usuários com cache local + GraphQL (AppSync)
   Corrigido: problemas TS com '??' vs '||', tipos e chamadas do graphqlRequest.
*/

import { fetchAuthSession } from "aws-amplify/auth";
import awsmobile from "../aws-exports";

export type ErrorDetail = {
  questionNumber?: number;
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

/* ============================
   CACHE LOCAL (localStorage)
   ============================ */
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

/* ============================
   GRAPHQL REQUEST (AppSync)
   - assinatura com 3 params: query, variables, context
   - prioriza token Cognito quando presente, senão usa API_KEY (se disponível)
   ============================ */
async function getIdTokenFromSession(): Promise<string | null> {
  try {
    const session: any = await fetchAuthSession();
    // session.tokens.idToken.jwtToken (amplify-auth lib)
    const maybeToken =
      session?.tokens?.idToken?.jwtToken ??
      (session?.tokens?.idToken && typeof session.tokens.idToken === "string"
        ? session.tokens.idToken
        : null);
    return maybeToken ?? null;
  } catch (err) {
    return null;
  }
}

async function graphqlRequest<T = any>(
  query: any,
  variables: Record<string, any> = {},
  context = ""
): Promise<T | null> {
  try {
    const url = awsmobile?.aws_appsync_graphqlEndpoint;
    const apiKey = awsmobile?.aws_appsync_apiKey;
    if (!url) {
      console.warn(`[graphqlRequest] AppSync endpoint não encontrado (${context})`);
      return null;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const idToken = await getIdTokenFromSession();
    if (idToken) {
      headers["Authorization"] = idToken.startsWith("Bearer ")
        ? idToken
        : `Bearer ${idToken}`;
    } else if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const q = typeof query === "string"
      ? query
      : (query?.loc?.source?.body ?? JSON.stringify(query));

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
      console.warn(`⚠️ GraphQL erro em ${context}:`, JSON.stringify(json.errors, null, 2));
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error(`❌ Erro graphqlRequest ${context}:`, err);
    return null;
  }
}

/* ============================
   USER FUNCTIONS
   ============================ */
export async function getUserById(userId: string) {
  console.log("🔍 getUserById chamado para:", userId);
  const cachedUser = localUserStore.get(userId);

  const QUERY = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
      achievements { items { id title createdAt moduleNumber } }
    }
  }`;

  const data = await graphqlRequest<any>(QUERY, { id: userId }, "GetUserById");
  if (data?.getUser) {
    console.log("✅ Usuário encontrado no GraphQL");
    // se cache tem pontos maiores, prioriza cache
    if (cachedUser && (cachedUser.points ?? 0) > (data.getUser.points ?? 0)) {
      console.log(
        `📦 Cache tem dados mais recentes (${cachedUser.points} vs ${data.getUser.points})`
      );
      return cachedUser;
    }
    localUserStore.set(userId, data.getUser);
    saveToStorage(STORAGE_KEYS.USERS, localUserStore);
    return data.getUser;
  }

  if (cachedUser) {
    console.log("📦 GraphQL falhou, usando cache local");
    return cachedUser;
  }

  console.warn("⚠️ Usuário não encontrado");
  return null;
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
    owner: userId,
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
    user = await createUserAsAdmin(userId, name, email);
  }
  return user;
}

export async function ensureUserExistsInDB(userId: string) {
  try {
    console.log(`🔍 Verificando usuário ${userId} no banco...`);
    const existing = await getUserById(userId);
    if (existing) {
      console.log("✅ Usuário encontrado");
      return existing;
    }
    console.log("⚠️ Usuário não encontrado");
    return null;
  } catch (error: any) {
    console.error("❌ Erro em ensureUserExistsInDB:", error);
    return null;
  }
}

/* ============================
   PROGRESS FUNCTIONS
   ============================ */
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
  saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
  return progress;
}

export async function getModuleProgressByUser(userId: string, moduleId: string | number) {
  const mid = String(moduleId);

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
    errorDetails: "[]",
  };

  const localProg = createLocalProgress(userId, mid, input.moduleNumber);
  console.log("📦 Progress criado no cache local");

  const MUT = `mutation CreateProgress($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT, { input }, "CreateProgress")
    .then((data) => {
      if (data?.createProgress) {
        console.log("✅ Progress criado no GraphQL");
        localProgressStore.set(`${userId}:${mid}`, data.createProgress);
        saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao criar progress no GraphQL:", err));

  return localProg;
}

// ============================================
// 🔧 GARANTIR QUE O PROGRESSO DO MÓDULO EXISTE
// ============================================
export async function ensureModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  try {
    const mid = String(moduleId);

    const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
      listProgresses(filter: $filter) {
        items {
          id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers
          timeSpent completed completedAt errorDetails
        }
      }
    }`;

    const filter = { userId: { eq: userId }, moduleId: { eq: mid } };
    const data = await graphqlRequest<any>(QUERY, { filter }, "EnsureModuleProgress");

    const remoteProgress = data?.listProgresses?.items?.[0];

    if (remoteProgress) {
      // ✅ Atualiza cache local
      localProgressStore.set(`${userId}:${mid}`, remoteProgress);
      saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      console.log("✅ Progresso encontrado no GraphQL");
      return remoteProgress;
    }

    // ❌ Não existe — cria novo
    console.log("⚠️ Progresso não encontrado, criando...");
    return await createModuleProgress(userId, moduleId, moduleNumber);

  } catch (err) {
    console.warn("⚠️ Erro em ensureModuleProgress:", err);
    // fallback no cache local
    const localProg = localProgressStore.get(`${userId}:${String(moduleId)}`);
    return localProg ?? createModuleProgress(userId, moduleId, moduleNumber);
  }
}


async function updateModuleProgressRaw(input: any) {
  // filtrar apenas campos permitidos
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
  const filtered = Object.fromEntries(
    Object.entries(input || {}).filter(([k]) => allowed.includes(k))
  );

  const found = filtered?.id ? findLocalProgressById(String((filtered as any).id)) : null;
  if (found) {
    const updated = { ...found.value, ...filtered };
    localProgressStore.set(found.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
    console.log("✅ Progress atualizado no cache local");
  }

  const MUT = `mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT, { input: filtered }, "UpdateProgress")
    .then((data) => {
      if (data?.updateProgress) console.log("✅ Progress atualizado no GraphQL");
    })
    .catch((err) => console.warn("⚠️ Falha ao atualizar progress no GraphQL:", err));

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
  const filtered = Object.fromEntries(
    Object.entries(input || {}).filter(([k]) => allowed.includes(k))
  );

  console.log("💾 Atualizando usuário:", filtered);
  const existing = localUserStore.get(String((input as any).id)) || {};
  const updated = { ...existing, ...filtered };
  localUserStore.set(String((input as any).id), updated);
  saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  console.log("✅ Usuário atualizado no cache local");

  const MUT = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id name email role coins points modulesCompleted currentModule correctAnswers wrongAnswers timeSpent precision
    }
  }`;

  graphqlRequest<any>(MUT, { input: filtered }, "UpdateUser")
    .then((data) => {
      if (data?.updateUser) {
        console.log("✅ Usuário atualizado no GraphQL");
        localUserStore.set(data.updateUser.id, data.updateUser);
        saveToStorage(STORAGE_KEYS.USERS, localUserStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao atualizar usuário no GraphQL:", err));

  return updated;
}

/* ============================
   FINISH MODULE
   ============================ */
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
    console.log("🎯 finishModule chamado com:", { userId, progressId, moduleNumber });

    const user = await getUserById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    let progressEntry = findLocalProgressById(progressId);
    if (!progressEntry) {
      const created = createLocalProgress(userId, String(moduleNumber), moduleNumber);
      progressEntry = { key: `${userId}:${moduleNumber}`, value: created };
    }

    const rawErrors = progressEntry.value?.errorDetails ?? [];
    const errorDetails = typeof rawErrors === "string" ? (() => {
      try { return JSON.parse(rawErrors); } catch { return []; }
    })() : rawErrors;
    const errorDetailsJSON = JSON.stringify(Array.isArray(errorDetails) ? errorDetails : []);

    const answeredNow = correctCount + wrongCount;
    const accuracyNow = answeredNow > 0 ? Math.round((correctCount / answeredNow) * 100) : 0;
    const completedAt = new Date().toISOString();

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

    const newPoints = (user.points ?? 0) + 12250;
    const newCoins = (user.coins ?? 0) + coinsEarned;

    const currentCompleted = user.modulesCompleted ?? [];
    const modulesCompleted = Array.isArray(currentCompleted) ? [...currentCompleted] : [];
    if (!modulesCompleted.includes(moduleNumber)) {
      modulesCompleted.push(moduleNumber);
    }

    const totalCorrect = (user.correctAnswers ?? 0) + correctCount;
    const totalWrong = (user.wrongAnswers ?? 0) + wrongCount;
    const totalTime = (user.timeSpent ?? 0) + timeSpent;
    const totalAnswers = totalCorrect + totalWrong;
    const totalPrecision = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    console.log("📊 Novos valores:", {
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

    // criar conquista automática se quiser (exemplo)
    if (accuracyNow >= 70) {
      await createAchievement(userId, `Conquista: Módulo ${moduleNumber} concluído com ${accuracyNow}%`);
    }

    console.log("✅ Módulo finalizado com sucesso!");
    return {
      newPoints,
      newCoins,
      achievement: { title: achievementTitle },
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

/* ============================
   OTHER HELPERS
   ============================ */
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
    const updated = { ...progress.value, correctAnswers: (progress.value.correctAnswers ?? 0) + 1 };
    localProgressStore.set(progress.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
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
    const updated = { ...progress.value, wrongAnswers: (progress.value.wrongAnswers ?? 0) + 1, errorDetails: errors };
    localProgressStore.set(progress.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
  }
  return true;
}

export async function getAllUsers() {
  console.log("📊 Buscando todos os usuários...");
  const QUERY = `query ListUsers {
    listUsers {
      items {
        id name email coins points modulesCompleted currentModule
        correctAnswers wrongAnswers timeSpent precision
      }
    }
  }`;

  const data = await graphqlRequest<any>(QUERY, {}, "ListAllUsers");
  if (data?.listUsers?.items) {
    console.log("✅ Usuários do GraphQL:", data.listUsers.items.length);
    const graphqlUsers = data.listUsers.items;
    const allUsers = [...graphqlUsers];

    for (const [userId, cachedUser] of localUserStore.entries()) {
      const existsInGraphQL = graphqlUsers.some((u: any) => u.id === userId);
      if (!existsInGraphQL) {
        console.log("📦 Adicionando usuário do cache:", userId);
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

    console.log("✅ Total de usuários (GraphQL + Cache):", allUsers.length);
    return allUsers;
  }

  console.log("⚠️ GraphQL falhou, usando apenas cache local");
  const cachedUsers = Array.from(localUserStore.values());
  console.log("📦 Usuários do cache:", cachedUsers.length);
  return cachedUsers;
}

/* ============================
   ACHIEVEMENTS
   ============================ */
export async function createAchievement(userId: string, title: string) {
  const MUT = `mutation CreateAchievement($input: CreateAchievementInput!) {
    createAchievement(input: $input) { id title description moduleNumber userId createdAt }
  }`;

  const moduleMatch = title.match(/módulo\s+(\d+)/i);
  const moduleNumber = moduleMatch ? parseInt(moduleMatch[1]) : 1;
  const input = { userId, title, moduleNumber, description: title };

  const data = await graphqlRequest<any>(MUT, { input }, "CreateAchievement");
  if (data?.createAchievement) return data.createAchievement;

  return { id: `temp-${Date.now()}`, title, userId, moduleNumber, createdAt: new Date().toISOString(), description: title };
}

/* ============================
   UTILITÁRIOS LOCAIS E EXPORTS
   ============================ */
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
  console.log("✅ Dados locais limpos com sucesso");
}

export default {
  getUserById,
  createUserAsAdmin,
  ensureUserInDB,
  ensureUserExistsInDB,
  getModuleProgressByUser,
  createModuleProgress,
  updateModuleProgressRaw,
  updateUserRaw,
  finishModule,
  createAchievement,
  getAllUsers,
  getLocalUser,
  getLocalProgress,
  clearLocalData,
};
