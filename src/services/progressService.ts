
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../aws-exports";

export type ErrorDetail = {
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

async function getIdTokenFromSession(): Promise<string | null> {
  try {
    const session: any = await fetchAuthSession();

    if (session?.getIdToken && typeof session.getIdToken === "function") {
      const t = session.getIdToken();
      if (t?.getJwtToken) return t.getJwtToken();
      if (t?.jwtToken) return t.jwtToken;
      if (typeof t === "string") return t;
    }

    if (session?.tokens?.idToken?.jwtToken) return session.tokens.idToken.jwtToken;
    if (session?.tokens?.idToken) {
      if (typeof session.tokens.idToken === "string") return session.tokens.idToken;
      if (session.tokens.idToken.toString) return session.tokens.idToken.toString();
    }

    if (session?.idToken?.jwtToken) return session.idToken.jwtToken;
    if (session?.idToken) {
      if (typeof session.idToken === "string") return session.idToken;
      if (session.idToken.toString) return session.idToken.toString();
    }

    return null;
  } catch {
    return null;
  }
}

async function graphqlRequest<T = any>(
  query: any,
  variables: Record<string, any> = {},
  context = ""
): Promise<T | null> {
  try {
    const authType: string | undefined =
      (awsconfig && (awsconfig.aws_appsync_authenticationType as string)) || process.env.APPSYNC_AUTH_TYPE;
    const url: string | undefined =
      (awsconfig && (awsconfig.aws_appsync_graphqlEndpoint as string)) || process.env.APPSYNC_URL;
    const apiKey: string | undefined = awsconfig?.aws_appsync_apiKey || process.env.APPSYNC_API_KEY;

    if (!url) {
      console.warn(`[graphqlRequest] AppSync endpoint não encontrado (${context})`);
      return null;
    }

    let q: string;
    if (typeof query === "string") q = query;
    else if ((query as any)?.loc?.source?.body) q = (query as any).loc.source.body;
    else if ((query as any)?.definitions) q = JSON.stringify(query);
    else q = String(query);

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (authType === "API_KEY" || authType === "APIKEY") {
      if (apiKey) headers["x-api-key"] = apiKey;
      else console.warn("[graphqlRequest] authType=API_KEY mas apiKey não encontrado");
    } else if (authType === "AMAZON_COGNITO_USER_POOLS" || !authType) {
      const idToken = await getIdTokenFromSession();
      if (idToken) {
        headers.Authorization = idToken.startsWith("Bearer ") ? idToken : `Bearer ${idToken}`;
      } else {
        console.warn(`[graphqlRequest] idToken não disponível (${context})`);
      }
    } else if (authType === "AWS_IAM") {
      console.warn("[graphqlRequest] authType=AWS_IAM detectado. Requisições IAM requerem assinatura SigV4. Não implementado aqui.");
      if (apiKey) headers["x-api-key"] = apiKey;
    } else {
      const idToken = await getIdTokenFromSession();
      if (idToken) headers.Authorization = idToken.startsWith("Bearer ") ? idToken : `Bearer ${idToken}`;
      else if (apiKey) headers["x-api-key"] = apiKey;
    }

    console.debug(`[graphqlRequest] ${context} authType=${authType} url=${url} hasAuth=${!!(headers.Authorization || headers["x-api-key"])}`);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: q, variables }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn(`⚠️ GraphQL HTTP erro em ${context}:`, res.status, res.statusText, txt);
      return null;
    }

    const json: any = await res.json().catch(() => null);
    if (!json) {
      console.warn(`⚠️ GraphQL resposta vazia em ${context}`);
      return null;
    }
    if (json.errors) {
      console.error(`❌ GraphQL erro em ${context}:`, JSON.stringify(json.errors, null, 2));
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`❌ Erro graphqlRequest ${context}:`, err);
    return null;
  }
}

/* --------------------- FALBACK LOCAL EM MEMÓRIA --------------------- */
// key: `${userId}:${moduleId}` -> progress object
const localProgressStore = new Map<string, any>();
// key: userId -> user object
const localUserStore = new Map<string, any>();

function findLocalProgressById(id: string) {
  for (const [key, value] of localProgressStore.entries()) {
    if (value?.id === id) return { key, value };
  }
  return null;
}

function createLocalProgress(userId: string, moduleId: string, moduleNumber: number) {
  const id = `local-${userId}-${moduleId}-${Date.now()}`;
  const progress = {
    id,
    userId,
    moduleId,
    moduleNumber,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    durationSec: 0,
    finished: false,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    errorDetails: [],
  };
  localProgressStore.set(`${userId}:${moduleId}`, progress);
  return progress;
}

/* --------------------- FUNÇÕES DE USUÁRIO --------------------- */

export async function ensureUserExistsInDB(userId: string) {
  const GET_USER = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule precision correctAnswers timeSpent
      achievements { items { id title createdAt } }
    }
  }`;
  const data = await graphqlRequest<any>(GET_USER, { id: userId }, "GetUser");
  return data?.getUser ?? localUserStore.get(userId) ?? null;
}

export async function createUserAsAdmin(input: { id: string; name: string; email: string; role?: string }) {
  const MUT = `mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role coins points modulesCompleted currentModule precision correctAnswers timeSpent
    }
  }`;
  const data = await graphqlRequest<any>(MUT, { input }, "CreateUserAsAdmin");
  if (!data?.createUser) {
    // fallback: store locally
    const u = { ...input, coins: 0, points: 0, modulesCompleted: [], achievements: [] };
    localUserStore.set(input.id, u);
    return u;
  }
  return data.createUser ?? null;
}

export async function getUserById(userId: string) {
  const GET_USER = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule precision correctAnswers timeSpent
      achievements { items { id title createdAt } }
    }
  }`;
  const data = await graphqlRequest<any>(GET_USER, { id: userId }, "GetUserById");
  if (!data?.getUser) {
    return localUserStore.get(userId) ?? null;
  }
  return data.getUser ?? null;
}

async function updateUserRaw(input: any) {
  const MUT = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id coins points modulesCompleted currentModule
      achievements { items { id title createdAt } }
    }
  }`;
  const data = await graphqlRequest<any>(MUT, { input }, "UpdateUser");
  if (!data?.updateUser) {
    console.warn("[updateUserRaw] backend indisponível ou mutation não existe — usando fallback local");
    // merge with existing local user if present
    const existing = input?.id ? (localUserStore.get(input.id) || {}) : {};
    const merged = { ...existing, ...input };
    if (input?.id) localUserStore.set(input.id, merged);
    return merged;
  }
  return data.updateUser ?? null;
}

/* --------------------- PROGRESSO DE MÓDULOS --------------------- */

export async function getModuleProgressByUser(userId: string, moduleId: string) {
  // Usa listProgresses (fácil compatibilidade com schemas gerados pelo Amplify)
  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items {
        id userId moduleId moduleNumber correct wrong accuracy durationSec finished startedAt finishedAt errorDetails
      }
    }
  }`;
  const filter = { userId: { eq: userId }, moduleId: { eq: moduleId } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "ModuleProgressByUser");
  if (!data?.listProgresses?.items?.[0]) {
    // fallback: buscar no armazenamento local
    const local = localProgressStore.get(`${userId}:${moduleId}`) ?? null;
    return local;
  }
  return data.listProgresses.items[0] ?? null;
}

export async function createModuleProgress(userId: string, moduleId: string, moduleNumber: number) {
  const MUT = `mutation CreateModuleProgress($input: CreateModuleProgressInput!) {
    createModuleProgress(input: $input) {
      id userId moduleId moduleNumber correct wrong accuracy durationSec finished startedAt
    }
  }`;
  const input = {
    userId,
    moduleId,
    moduleNumber,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    durationSec: 0,
    finished: false,
    startedAt: new Date().toISOString(),
    errorDetails: [],
  };
  const data = await graphqlRequest<any>(MUT, { input }, "CreateModuleProgress");
  if (!data?.createModuleProgress) {
    console.warn("[createModuleProgress] mutation não disponível — criando progresso local temporário");
    return createLocalProgress(userId, moduleId, moduleNumber);
  }
  // persist returned progress in local store as cache
  const created = data.createModuleProgress;
  localProgressStore.set(`${userId}:${moduleId}`, created);
  return created ?? null;
}

export async function ensureModuleProgress(userId: string, moduleId: string, moduleNumber: number) {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) return existing;
  const created = await createModuleProgress(userId, moduleId, moduleNumber);
  if (created) return created;
  // fallback local
  const local = createLocalProgress(userId, moduleId, moduleNumber);
  return local;
}

async function updateModuleProgressRaw(input: any) {
  const MUT = `mutation UpdateModuleProgress($input: UpdateModuleProgressInput!) {
    updateModuleProgress(input: $input) {
      id userId moduleId moduleNumber correct wrong accuracy durationSec finished finishedAt errorDetails
    }
  }`;
  const data = await graphqlRequest<any>(MUT, { input }, "UpdateModuleProgress");
  if (!data?.updateModuleProgress) {
    console.warn("[updateModuleProgressRaw] mutation não disponível. Aplicando fallback local (retornando objeto input).");
    // tentar atualizar progresso local por id
    const found = input?.id ? findLocalProgressById(input.id) : null;
    if (found) {
      const updated = { ...found.value, ...input };
      localProgressStore.set(found.key, updated);
      return updated;
    }
    // se tiver userId/moduleId, setamos diretamente
    if (input?.userId && input?.moduleId) {
      const key = `${input.userId}:${input.moduleId}`;
      const existing = localProgressStore.get(key) || { id: `local-${input.userId}-${input.moduleId}-${Date.now()}`, userId: input.userId, moduleId: input.moduleId, moduleNumber: input.moduleNumber ?? 0, correct: 0, wrong: 0, accuracy: 0, finished: false, startedAt: new Date().toISOString(), errorDetails: [] };
      const merged = { ...existing, ...input };
      localProgressStore.set(key, merged);
      return merged;
    }
    // retorno input como fallback mínimo
    return { ...input };
  }
  const updated = data.updateModuleProgress;
  // se backend respondeu, atualizamos cache local também
  if (updated?.userId && updated?.moduleId) localProgressStore.set(`${updated.userId}:${updated.moduleId}`, updated);
  return updated ?? null;
}

/* --------------------- REGISTRO DE RESPOSTAS --------------------- */

export async function registerCorrect(userId: string, progressId: string) {
  const GET = `query GetProgress($id: ID!) {
    getModuleProgress(id: $id) { id correct wrong errorDetails userId moduleId }
  }`;
  const data = await graphqlRequest<any>(GET, { id: progressId }, "GetProgress");
  const cur = data?.getModuleProgress ?? null;

  // se backend não fornecer, busca por id no local
  const curObj = cur ?? (findLocalProgressById(progressId)?.value ?? { id: progressId, correct: 0, wrong: 0, errorDetails: [] });

  const newCorrect = (curObj.correct || 0) + 1;
  const total = newCorrect + (curObj.wrong || 0);
  const accuracy = total > 0 ? newCorrect / total : 0;

  await updateModuleProgressRaw({ id: progressId, correct: newCorrect, accuracy });

  const user = await getUserById(userId);
  const newCoins = (user?.coins || 0) + 15;
  await updateUserRaw({ id: userId, coins: newCoins });

  return { newCorrect, accuracy, newCoins };
}

export async function registerWrong(progressId: string, errorDetail: ErrorDetail) {
  const GET = `query GetProgress($id: ID!) {
    getModuleProgress(id: $id) { id correct wrong errorDetails userId moduleId }
  }`;
  const data = await graphqlRequest<any>(GET, { id: progressId }, "GetProgress");
  const cur = data?.getModuleProgress ?? (findLocalProgressById(progressId)?.value ?? { id: progressId, correct: 0, wrong: 0, errorDetails: [] });

  const newWrong = (cur.wrong || 0) + 1;
  const total = (cur.correct || 0) + newWrong;
  const accuracy = total > 0 ? (cur.correct || 0) / total : 0;
  const newErrors = [...(cur.errorDetails || []), errorDetail];

  await updateModuleProgressRaw({ id: progressId, wrong: newWrong, accuracy, errorDetails: newErrors });
  return { newWrong, accuracy, newErrors };
}

/* --------------------- FINALIZAR MÓDULO --------------------- */

export async function finishModule(userId: string, progressId: string, moduleNumber: number, durationSec: number, achievementTitle: string) {
  await updateModuleProgressRaw({
    id: progressId,
    finished: true,
    durationSec,
    finishedAt: new Date().toISOString(),
  });

  const user = await getUserById(userId);
  if (!user) return null;

  const currentPoints = user.points || 0;
  const newPoints = currentPoints + 12250;

  const newModulesCompleted = [...(user.modulesCompleted || []), moduleNumber];

  const newAchievements = [
    ...(user.achievements?.items || []),
    { id: `temp-${Date.now()}`, title: achievementTitle, createdAt: new Date().toISOString() },
  ];

  await updateUserRaw({ id: userId, points: newPoints, modulesCompleted: newModulesCompleted, achievements: newAchievements });
  return { newPoints, newModulesCompleted, newAchievements };
}

/* --------------------- BLOQUEIO DE MÓDULOS --------------------- */

export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;

  // usa listProgresses para aumentar compatibilidade com schemas gerados
  const LIST = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber finished }
    }
  }`;

  const filter = {
    userId: { eq: userId },
    moduleNumber: { eq: moduleNumber - 1 },
  };
  const data = await graphqlRequest<any>(LIST, { filter }, "ListProgress");

  if (!data?.listProgresses?.items) {
    // fallback: checar localProgressStore
    for (const prog of localProgressStore.values()) {
      if (String(prog.userId) === String(userId) && Number(prog.moduleNumber) === Number(moduleNumber - 1) && prog.finished === true) {
        return true;
      }
    }
    return false;
  }

  const item = data?.listProgresses?.items?.[0];
  return !!item && item.finished === true;
}
