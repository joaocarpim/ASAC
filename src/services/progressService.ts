/* progressService.ts
   Serviço de progresso / usuários com cache local + GraphQL (AppSync)
   - Compatível com seu schema:
     - modulesCompleted: [Int]
     - errorDetails: AWSJSON
   - Política de desbloqueio: BLOQUEAR (só pode abrir módulo N se completou N-1)
   - Usa cache local (localStorage) como fallback/respaldo
   - Usa token Cognito quando disponível; caso contrário usa API_KEY para leituras públicas
*/

import { fetchAuthSession } from "aws-amplify/auth";
import awsmobile from "../aws-exports";

/* -------------------------
   Tipos
   ------------------------- */
export type ErrorDetail = {
  questionNumber?: number;
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
   GraphQL request helper
   - prioriza token Cognito (userPools). Se não houver token,
     usa API_KEY (se existir) mas restringe mutations (não tentar mutar sem token).
   =========================== */

async function getIdTokenFromSession(): Promise<string | null> {
  try {
    const session: any = await fetchAuthSession();
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

/**
 * graphqlRequest
 * - query: string ou objeto (geralmente passamos string)
 * - variables: object
 * - context: string (usado em logs)
 *
 * Nota importante: se a operação for uma mutation e NÃO houver token Cognito,
 * o request é pulado (retorna null) para evitar erros "Not Authorized".
 */
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

    const q = typeof query === "string"
      ? query
      : (query?.loc?.source?.body ?? JSON.stringify(query));
    const qLower = (q || "").trim().toLowerCase();

    // SE for mutation e não houver token, não enviamos (evita erros Unauthorized)
    if (!idToken && qLower.startsWith("mutation")) {
      console.debug(`[graphqlRequest] skip mutation (no Cognito token) — ${context}`);
      return null;
    }

    if (idToken) {
      headers["Authorization"] = idToken.startsWith("Bearer ")
        ? idToken
        : `Bearer ${idToken}`;
    } else if (apiKey) {
      headers["x-api-key"] = apiKey;
    } else {
      console.warn(`[graphqlRequest] Sem token Cognito e sem API_KEY (${context}).`);
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: q, variables }),
    });

    if (!res.ok) {
      console.warn(`⚠️ GraphQL HTTP erro em ${context}:`, res.status);
      try {
        const text = await res.text();
        console.debug(`[graphqlRequest] response text (${context}):`, text);
      } catch {}
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
      achievements { items { id title createdAt moduleNumber } }
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
  const data = await graphqlRequest<any>(query, { id: userId }, "GetUserById");

  if (data?.getUser) {
    console.log("✅ Usuário encontrado no GraphQL");
    if (data.getUser.progress?.items) {
      data.getUser.progress.items = data.getUser.progress.items.map((p: any) => ({
        ...p,
        errorDetails: normalizeErrorDetailsFromServer(p.errorDetails),
      }));
    }

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
  // se não houver token, tentamos criar via GraphQL vai ser pulado pelo graphqlRequest
  const data = await graphqlRequest<any>(MUT, { input }, "CreateUserAsAdmin");
  if (data?.createUser) {
    console.log("✅ Usuário criado no GraphQL");
    localUserStore.set(userId, data.createUser);
    saveToStorage(STORAGE_KEYS.USERS, localUserStore);
    return data.createUser;
  }

  console.log("📦 GraphQL falhou ou não autenticado, criando apenas no cache local");
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

/* ===========================
   List / Get Module Progress
   =========================== */
export async function getModuleProgressByUser(userId: string, moduleId: string | number) {
  const mid = String(moduleId);

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    // sem token: retornar cache local (evita Unauthorized)
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

/* ===========================
   Create Progress
   =========================== */
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
    console.debug("createModuleProgress: sem token Cognito — pulando criação remota");
    return localProg;
  }

  const MUT = `mutation CreateProgress($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT, { input }, "CreateProgress")
    .then((data) => {
      if (data?.createProgress) {
        console.log("✅ Progress criado no GraphQL");
        const server = data.createProgress;
        server.errorDetails = normalizeErrorDetailsFromServer(server.errorDetails);
        localProgressStore.set(`${userId}:${mid}`, server);
        saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao criar progress no GraphQL:", err));

  return localProg;
}

/* ===========================
   Ensure module progress (BLOQUEAR logic)
   =========================== */
export async function ensureModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  try {
    const mid = String(moduleId);

    const idToken = await getIdTokenFromSession();
    if (!idToken) {
      // sem token: usar cache/ criar local
      const localProg = localProgressStore.get(`${userId}:${mid}`);
      if (localProg) return localProg;
      console.log("ensureModuleProgress: sem token, criando local");
      return createLocalProgress(userId, mid, moduleNumber);
    }

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

/* ===========================
   Update Progress (raw)
   =========================== */
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
  const filtered = Object.fromEntries(
    Object.entries(input || {}).filter(([k]) => allowed.includes(k))
  );

  const found = filtered?.id ? findLocalProgressById(String((filtered as any).id)) : null;
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

  const MUT = `mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed completedAt errorDetails
    }
  }`;

  graphqlRequest<any>(MUT, { input: filtered }, "UpdateProgress")
    .then((data) => {
      if (data?.updateProgress) {
        console.log("✅ Progress atualizado no GraphQL");
        const srv = data.updateProgress;
        srv.errorDetails = normalizeErrorDetailsFromServer(srv.errorDetails);
        localProgressStore.set(`${srv.userId}:${srv.moduleId}`, srv);
        saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
      }
    })
    .catch((err) => console.warn("⚠️ Falha ao atualizar progress no GraphQL:", err));

  return found?.value || filtered;
}

/* ===========================
   Update user raw (somente campos permitidos)
   =========================== */
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

  if (!filtered.id) {
    console.warn("updateUserRaw chamado sem id");
    return null;
  }

  console.log("💾 Atualizando usuário (local):", filtered);
  const existing = localUserStore.get(String((input as any).id)) || {};
  const updated = { ...existing, ...filtered };
  localUserStore.set(String((input as any).id), updated);
  saveToStorage(STORAGE_KEYS.USERS, localUserStore);
  console.log("✅ Usuário atualizado no cache local");

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    console.debug("updateUserRaw: sem token — pulando update remoto");
    return updated;
  }

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

/* ===========================
   Finish module
   =========================== */
export async function finishModule(
  userId: string,
  progressId: string,
  moduleNumber: number,
  timeSpent: number,
  coinsEarned = 150,
  correctCount = 0,
  wrongCount = 0
) {
  try {
    console.log("🎯 finishModule chamado com:", { userId, progressId, moduleNumber });

    const user = await getUserById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const found = findLocalProgressById(progressId);
    if (!found) {
      createLocalProgress(userId, String(moduleNumber), moduleNumber);
    }

    const totalAnswered = correctCount + wrongCount;
    const accuracyNow = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

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

    const updatedModules = Array.from(new Set([...(user.modulesCompleted ?? []), moduleNumber]));
    const newPoints =
      (user.points ?? 0) +
      (moduleNumber * 500) +
      (accuracyNow * 20) +
      (correctCount * 10) -
      (wrongCount * 5);

    const updatePayload = {
      id: userId,
      modulesCompleted: updatedModules,
      precision: newPrecision,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: (user.timeSpent ?? 0) + timeSpent,
      coins: (user.coins ?? 0) + coinsEarned,
      points: newPoints,
      currentModule: Math.min(moduleNumber + 1, 99),
    };

    const updateResult = await updateUserRaw(updatePayload);

    if (accuracyNow >= 70) {
      try {
        const idToken = await getIdTokenFromSession();
        if (idToken) {
          const listQ = `query ListAchievements($filter: ModelAchievementFilterInput) {
            listAchievements(filter: $filter) {
              items { id title moduleNumber userId createdAt }
            }
          }`;
          const filter = { userId: { eq: userId }, moduleNumber: { eq: moduleNumber } };
          const listData = await graphqlRequest<any>(listQ, { filter }, "ListAchievementsBeforeCreate");
          const already = listData?.listAchievements?.items?.length > 0;
          if (!already) {
            await createAchievement(userId, `Módulo ${moduleNumber} concluído com ${accuracyNow}%`);
          } else {
            console.log("🏅 Achievement já existe, não criando duplicado.");
          }
        } else {
          console.debug("finishModule: sem token — não verifica/cria achievement remoto");
        }
      } catch (err) {
        console.warn("⚠️ Erro ao verificar/criar achievement:", err);
      }
    }

    console.log("✅ finishModule: concluído", {
      accuracyNow,
      updateResult,
    });

    {
      const updatedUserLocal = {
        ...user,
        modulesCompleted: updatedModules,
        currentModule: Math.min(moduleNumber + 1, 99),
      };

      console.log("🎓 Salvando módulos concluídos no cache local:", updatedModules);
      localUserStore.set(userId, updatedUserLocal);
      saveToStorage(STORAGE_KEYS.USERS, localUserStore);
    }

    return { accuracy: accuracyNow, updateResult };
  } catch (err) {
    console.error("❌ Erro em finishModule:", err);
    throw err;
  }
}

/* ===========================
   canStartModule (BLOQUEAR)
   =========================== */
export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;

  const idToken = await getIdTokenFromSession();
  if (!idToken) {
    // sem token: contamos apenas cache local
    const cached = Array.from(localProgressStore.values()).filter((p: any) => p.userId === userId && p.completed === true);
    const uniqueCompleted = Array.from(new Set(cached.map((p: any) => p.moduleNumber)));
    return uniqueCompleted.length >= moduleNumber - 1;
  }

  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { moduleNumber completed }
    }
  }`;

  const filter = { userId: { eq: userId } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "CanStartModule");
  const items: any[] = data?.listProgresses?.items || [];

  const cached = Array.from(localProgressStore.values()).filter((p: any) => p.userId === userId);
  const combined = [...items, ...cached];

  const completedCount = combined.filter((p: any) => p.completed === true).map((p) => p.moduleNumber);
  const uniqueCompleted = Array.from(new Set(completedCount));
  const completedTotal = uniqueCompleted.length;

  return completedTotal >= moduleNumber - 1;
}

/* ===========================
   registerCorrect / registerWrong
   =========================== */
export async function registerCorrect(userId: string, progressId: string) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    const updated = { ...progress.value, correctAnswers: (progress.value.correctAnswers ?? 0) + 1 };
    localProgressStore.set(progress.key, updated);
    saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);
    updateModuleProgressRaw({ id: progress.value.id, correctAnswers: updated.correctAnswers });
  }
  return true;
}

export async function registerWrong(progressId: string, errorDetail: ErrorDetail) {
  const entry = findLocalProgressById(progressId);
  if (!entry) return;

  let errors = entry.value.errorDetails;
  if (!Array.isArray(errors)) {
    try { errors = JSON.parse(errors || "[]"); } catch { errors = []; }
  }

  errors = Array.isArray(errors) ? errors : [];
  errors.push(errorDetail);

  const updated = { ...entry.value, wrongAnswers: (entry.value.wrongAnswers ?? 0) + 1, errorDetails: errors };
  localProgressStore.set(entry.key, updated);
  saveToStorage(STORAGE_KEYS.PROGRESS, localProgressStore);

  updateModuleProgressRaw({
    id: entry.value.id,
    wrongAnswers: updated.wrongAnswers,
    errorDetails: stringifyErrorDetailsForServer(errors),
  });

  return true;
}

/* ===========================
   getAllUsers (para ranking)
   =========================== */
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
  const cachedUsers = Array.from(localUserStore.values()).map((u: any) => ({
    ...u,
    coins: u.coins ?? 0,
    points: u.points ?? 0,
    modulesCompleted: u.modulesCompleted ?? [],
    correctAnswers: u.correctAnswers ?? 0,
    wrongAnswers: u.wrongAnswers ?? 0,
    timeSpent: u.timeSpent ?? 0,
    precision: u.precision ?? 0,
  }));
  console.log("📦 Usuários do cache:", cachedUsers.length);
  return cachedUsers;
}

/* ===========================
   Achievements: criar com checagem para não duplicar
   =========================== */
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
    console.debug("createAchievement: sem token — pulando criação remota; retornando temporário");
    return { id: `temp-${Date.now()}`, title, userId, moduleNumber: moduleFromTitle ?? 0, createdAt: new Date().toISOString(), description: title };
  }

  const data = await graphqlRequest<any>(MUT, { input }, "CreateAchievement");
  if (data?.createAchievement) {
    console.log("🏅 Achievement criado:", data.createAchievement.id);
    return data.createAchievement;
  }

  console.warn("⚠️ Falha ao criar achievement no GraphQL — retornando temporário");
  return { id: `temp-${Date.now()}`, title, userId, moduleNumber: moduleFromTitle ?? 0, createdAt: new Date().toISOString(), description: title };
}

/* ===========================
   Utilitários locais e exports
   =========================== */
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

/* ===========================
   Exports padrão
   =========================== */
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
