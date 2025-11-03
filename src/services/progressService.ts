import { fetchAuthSession } from "aws-amplify/auth";
import awsmobile from "../aws-exports";

export type ErrorDetail = {
  questionNumber?: number;
  questionId: string;
  questionText?: string | null;
  userAnswer?: string | null;
  expectedAnswer?: string | null;
};

/* --------------------- AUTH HELPERS --------------------- */
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

/* --------------------- GENERIC GRAPHQL REQUEST --------------------- */
async function graphqlRequest<T = any>(
  query: any,
  variables: Record<string, any> = {},
  context = ""
): Promise<T | null> {
  try {
    const authType: string | undefined =
      (awsmobile && (awsmobile.aws_appsync_authenticationType as string)) ||
      process.env.APPSYNC_AUTH_TYPE;
    const url: string | undefined =
      (awsmobile&& (awsmobile.aws_appsync_graphqlEndpoint as string)) || process.env.APPSYNC_URL;
    const apiKey: string | undefined = awsmobile?.aws_appsync_apiKey || process.env.APPSYNC_API_KEY;

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

/* --------------------- USUÁRIO --------------------- */
export async function getUserById(userId: string) {
  const QUERY = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted currentModule
      correctAnswers wrongAnswers timeSpent precision
      achievements { items { id title createdAt moduleNumber } }
    }
  }`;
  const data = await graphqlRequest<any>(QUERY, { id: userId }, "GetUserById");
  return data?.getUser ?? null;
}

export async function createUserAsAdmin(userId: string, name: string, email: string) {
  const MUT = `mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role coins points modulesCompleted currentModule
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
  const data = await graphqlRequest<any>(MUT, { input }, "CreateUserAsAdmin");
  if (!data?.createUser) {
    console.warn("[createUserAsAdmin] Falha ao criar usuário no DB, usando fallback local");
    const fallbackUser = { ...input };
    localUserStore.set(userId, fallbackUser);
    return fallbackUser;
  }
  return data.createUser;
}

export async function ensureUserInDB(userId: string, name: string, email: string) {
  let user = await getUserById(userId);
  if (!user) {
    console.log(`⚠️ Usuário ${userId} não existe no DB. Criando...`);
    user = await createUserAsAdmin(userId, name, email);
  }
  return user;
}

export async function ensureUserExistsInDB(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    console.warn(`Usuário com id ${userId} não encontrado no banco de dados.`);
    return null;
  }
  return user;
}

/* --------------------- STORES LOCAIS --------------------- */
const localProgressStore = new Map<string, any>();
const localUserStore = new Map<string, any>();

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
    errorDetails: [] as ErrorDetail[],
  };
  localProgressStore.set(`${userId}:${mid}`, progress);
  return progress;
}

/* --------------------- CREATE ACHIEVEMENT --------------------- */
export async function createAchievement(userId: string, title: string) {
  console.log(`🏅 Criando conquista: "${title}" para usuário ${userId}`);
  
  const MUT = `mutation CreateAchievement($input: CreateAchievementInput!) {
    createAchievement(input: $input) { id title createdAt userId moduleNumber }
  }`;

  const moduleMatch = title.match(/módulo\s+(\d+)/i);
  const moduleNumber = moduleMatch ? parseInt(moduleMatch[1]) : 1;

  const input = { 
    userId, 
    title,
    moduleNumber,
    description: title
  };

  const data = await graphqlRequest<any>(MUT, { input }, "CreateAchievement");
  
  if (data?.createAchievement) {
    console.log(`✅ Conquista criada com sucesso:`, data.createAchievement);
    return data.createAchievement;
  } else {
    console.warn(`⚠️ Falha ao criar conquista no DB, usando fallback local`);
    return {
      id: `temp-${Date.now()}`,
      title,
      userId,
      moduleNumber,
      createdAt: new Date().toISOString(),
    };
  }
}

/* --------------------- PROGRESSO DE MÓDULOS --------------------- */
export async function getModuleProgressByUser(userId: string, moduleId: string | number) {
  const mid = String(moduleId);
  const QUERY = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed errorDetails }
    }
  }`;
  const filter = { userId: { eq: userId }, moduleId: { eq: mid } };
  const data = await graphqlRequest<any>(QUERY, { filter }, "ListProgresses");
  return data?.listProgresses?.items?.[0] ?? localProgressStore.get(`${userId}:${mid}`) ?? null;
}

export async function createModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const mid = String(moduleId);
  const MUT = `mutation CreateProgress($input: CreateProgressInput!) {
    createProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed
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
  };
  const data = await graphqlRequest<any>(MUT, { input }, "CreateProgress");
  if (!data?.createProgress) {
    console.warn("[createModuleProgress] mutation ausente — fallback local");
    return createLocalProgress(userId, mid, input.moduleNumber);
  }
  const created = data.createProgress;
  localProgressStore.set(`${userId}:${mid}`, created);
  return created ?? null;
}

export async function ensureModuleProgress(userId: string, moduleId: string | number, moduleNumber?: number) {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) return existing;
  const created = await createModuleProgress(userId, moduleId, moduleNumber);
  return created ?? createLocalProgress(userId, moduleId, moduleNumber);
}

/* --------------------- UPDATE MODULE PROGRESS --------------------- */
async function updateModuleProgressRaw(input: any) {
  const MUT = `mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
      id userId moduleId moduleNumber accuracy correctAnswers wrongAnswers timeSpent completed
    }
  }`;
  const data = await graphqlRequest<any>(MUT, { input }, "UpdateProgress");
  if (!data?.updateProgress) {
    console.warn("[updateModuleProgressRaw] mutation não disponível, aplicando fallback local.");
    const found = input?.id ? findLocalProgressById(input.id) : null;
    if (found) {
      const updated = { ...found.value, ...input };
      localProgressStore.set(found.key, updated);
      return updated;
    }
    if (input?.userId && input?.moduleId) {
      const key = `${input.userId}:${String(input.moduleId)}`;
      const existing = localProgressStore.get(key) || createLocalProgress(input.userId, input.moduleId, input.moduleNumber);
      const merged = { ...existing, ...input };
      localProgressStore.set(key, merged);
      return merged;
    }
    return { ...input };
  }
  const updated = data.updateProgress;
  if (updated?.userId && updated?.moduleId) localProgressStore.set(`${updated.userId}:${String(updated.moduleId)}`, updated);
  return updated ?? null;
}

/* --------------------- ATUALIZAÇÃO DE USUÁRIO --------------------- */
async function updateUserRaw(input: any) {
  const MUT = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id name email role coins points modulesCompleted currentModule correctAnswers wrongAnswers timeSpent precision
    }
  }`;

  const data = await graphqlRequest<any>(MUT, { input }, "UpdateUser");
  if (!data?.updateUser) {
    console.warn("[updateUserRaw] mutation não disponível, aplicando fallback local.");
    const existing = localUserStore.get(input.id) || {};
    const updated = { ...existing, ...input };
    localUserStore.set(input.id, updated);
    return updated;
  }
  const updated = data.updateUser;
  if (updated?.id) localUserStore.set(updated.id, updated);
  return updated ?? null;
}

/* --------------------- FINALIZAR MÓDULO --------------------- */
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
  console.log(`🎯 Finalizando módulo ${moduleNumber} para usuário ${userId}`);
  console.log(`📊 Dados: ${correctCount} acertos, ${wrongCount} erros, ${timeSpent}s tempo`);
  
  try {
    let progress = findLocalProgressById(progressId);
    
    if (!progress) {
      console.log(`📝 Progress ${progressId} não encontrado localmente, buscando no DB...`);
      progress = { value: await getModuleProgressByUser(userId, moduleNumber) };
    }

    if (!progress?.value) {
      console.log(`📝 Criando novo registro de progresso para módulo ${moduleNumber}`);
      progress = { value: await createModuleProgress(userId, String(moduleNumber), moduleNumber) };
    }

    const errorDetails = progress?.value?.errorDetails || [];
    const errorDetailsJSON = JSON.stringify(errorDetails);

    console.log(`📝 ErrorDetails a serem salvos (${errorDetails.length} erros):`, errorDetails);

    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    console.log(`🎯 Precisão calculada: ${accuracy}% (${correctCount}/${totalAnswered})`);

    if (progress?.value?.id) {
      const updateData = {
        id: progress.value.id,
        completed: true,
        timeSpent: timeSpent,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        accuracy: accuracy,
        errorDetails: errorDetailsJSON,
      };

      console.log(`💾 Salvando no DynamoDB:`, updateData);

      await updateModuleProgressRaw(updateData);
      console.log(`✅ Progress ${progress.value.id} atualizado com sucesso!`);
    }

    const user = await getUserById(userId);
    if (!user) {
      console.warn("⚠️ Usuário não encontrado ao finalizar módulo");
      return null;
    }

    const newPoints = (user.points || 0) + 12250;
    const newCoins = (user.coins || 0) + coinsEarned;
    
    const currentCompleted = user.modulesCompleted || [];
    const modulesCompleted = Array.isArray(currentCompleted) ? [...currentCompleted] : [];
    
    if (!modulesCompleted.includes(moduleNumber)) {
      modulesCompleted.push(moduleNumber);
      console.log(`✅ Módulo ${moduleNumber} adicionado à lista de concluídos`);
    }

    const totalCorrect = (user.correctAnswers || 0) + correctCount;
    const totalWrong = (user.wrongAnswers || 0) + wrongCount;
    const totalTime = (user.timeSpent || 0) + timeSpent;
    const totalAnswered = totalCorrect + totalWrong;
    const totalPrecision = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    console.log(`📊 Estatísticas totais do usuário:`);
    console.log(`   Total acertos: ${totalCorrect}`);
    console.log(`   Total erros: ${totalWrong}`);
    console.log(`   Precisão total: ${totalPrecision}%`);

    const updateResult = await updateUserRaw({ 
      id: userId, 
      points: newPoints,
      coins: newCoins,
      modulesCompleted: modulesCompleted,
      currentModule: Math.min(moduleNumber + 1, 3),
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      timeSpent: totalTime,
      precision: totalPrecision,
    });

    console.log(`💰 Pontos atualizados: ${newPoints}, Moedas: ${newCoins}`);
    console.log(`📚 Módulos concluídos: ${modulesCompleted.join(", ")}`);

    const achievement = await createAchievement(userId, achievementTitle);
    console.log(`🏆 Conquista criada: ${achievementTitle}`);

    return { 
      newPoints, 
      newCoins, 
      achievement, 
      modulesCompleted, 
      updateResult,
      progressId: progress?.value?.id,
      accuracy,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
    };
  } catch (error) {
    console.error("❌ Erro ao finalizar módulo:", error);
    throw error;
  }
}

/* --------------------- BLOQUEIO DE MÓDULOS --------------------- */
export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;

  const LIST = `query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber completed }
    }
  }`;

  const filter = { userId: { eq: userId } };
  const data = await graphqlRequest<any>(LIST, { filter }, "ListProgressesForCanStart");

  if (!data?.listProgresses?.items) {
    for (const prog of localProgressStore.values()) {
      if (String(prog.userId) === String(userId) && prog.completed === true) {
        return true;
      }
    }
    return false;
  }

  const completedModules = data.listProgresses.items.filter((p: any) => p.completed === true);
  return completedModules.length >= moduleNumber - 1;
}

/* --------------------- REGISTRAR ACERTOS E ERROS --------------------- */
export async function registerCorrect(userId: string, progressId: string) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    const updated = {
      ...progress.value,
      correctAnswers: (progress.value.correctAnswers || 0) + 1,
    };
    localProgressStore.set(progress.key, updated);
  }
  return true;
}

export async function registerWrong(progressId: string, errorDetail: ErrorDetail) {
  const progress = findLocalProgressById(progressId);
  if (progress) {
    const errors = progress.value.errorDetails || [];
    errors.push(errorDetail);
    const updated = {
      ...progress.value,
      wrongAnswers: (progress.value.wrongAnswers || 0) + 1,
      errorDetails: errors,
    };
    localProgressStore.set(progress.key, updated);
    console.log("✅ Erro registrado localmente:", errorDetail);
  }
  return true;
}

/* --------------------- LISTAR TODOS OS USUÁRIOS --------------------- */
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