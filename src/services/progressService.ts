import { fetchAuthSession } from "aws-amplify/auth";

type ErrorDetail = {
  questionId: string;
  questionText?: string;
  userAnswer?: string;
  expectedAnswer?: string;
};

// Função base para todas as requisições GraphQL
async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any>,
  context: string
): Promise<T | null> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const res = await fetch(
      "https://izr4ayivprhodgqzf3gm6ijwh4.appsync-api.us-east-1.amazonaws.com/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    if (!res.ok) {
      console.warn(`⚠️ GraphQL HTTP erro em ${context}:`, res.status, res.statusText);
      return null;
    }

    const json: any = await res.json();
    if (json.errors) {
      console.error(`❌ GraphQL erro em ${context}:`, JSON.stringify(json.errors, null, 2));
      return null;
    }

    return json.data;
  } catch (err) {
    console.error(`❌ Erro em ${context}:`, err);
    return null;
  }
}

/* --------------------- FUNÇÕES DE USUÁRIO --------------------- */

export async function ensureUserExistsInDB(userId: string, username?: string, email?: string) {
  const GET_USER = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted precision correctAnswers wrongAnswers timeSpent
      achievements {
        items {
          id
          title
          createdAt
        }
      }
    }
  }`;

  const CREATE_USER = `mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role coins points modulesCompleted precision correctAnswers wrongAnswers timeSpent
      achievements {
        items {
          id
          title
          createdAt
        }
      }
    }
  }`;

  const data = await graphqlRequest<any>(GET_USER, { id: userId }, "GetUser");
  if (data?.getUser) return data.getUser;

  const input = {
    id: userId,
    name: username ?? "Usuário",
    email: email ?? "",
    role: "User",
    coins: 0,
    points: 0,
    modulesCompleted: [], // ✅ agora array vazio
    currentModule: 1,
    precision: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeSpent: "0s",
  };

  const createData = await graphqlRequest<any>(CREATE_USER, { input }, "CreateUser");
  return createData?.createUser ?? null;
}

export async function getUserById(userId: string) {
  const GET_USER = `query GetUser($id: ID!) {
    getUser(id: $id) {
      id name email role coins points modulesCompleted precision correctAnswers wrongAnswers timeSpent
      achievements {
        items {
          id
          title
          createdAt
        }
      }
    }
  }`;

  const data = await graphqlRequest<any>(GET_USER, { id: userId }, "GetUserById");
  return data?.getUser ?? null;
}

async function updateUserRaw(input: any) {
  const MUT = `mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id coins points modulesCompleted
      achievements {
        items {
          id
          title
          createdAt
        }
      }
    }
  }`;

  const data = await graphqlRequest<any>(MUT, { input }, "UpdateUser");
  return data?.updateUser ?? null;
}

/* --------------------- PROGRESSO DE MÓDULOS --------------------- */

export async function getModuleProgressByUser(userId: string, moduleId: string) {
  const QUERY = `query ModuleProgressByUser($userId: ID!, $moduleId: ID!) {
    moduleProgressByUser(userId: $userId, moduleId: $moduleId) {
      items {
        id userId moduleId moduleNumber correct wrong accuracy durationSec finished startedAt finishedAt errorDetails
      }
    }
  }`;

  const data = await graphqlRequest<any>(QUERY, { userId, moduleId }, "ModuleProgressByUser");
  return data?.moduleProgressByUser?.items?.[0] ?? null;
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
  return data?.createModuleProgress ?? null;
}

export async function ensureModuleProgress(userId: string, moduleId: string, moduleNumber: number) {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) return existing;
  return createModuleProgress(userId, moduleId, moduleNumber);
}

async function updateModuleProgressRaw(input: any) {
  const MUT = `mutation UpdateModuleProgress($input: UpdateModuleProgressInput!) {
    updateModuleProgress(input: $input) {
      id userId moduleId moduleNumber correct wrong accuracy durationSec finished finishedAt errorDetails
    }
  }`;

  const data = await graphqlRequest<any>(MUT, { input }, "UpdateModuleProgress");
  return data?.updateModuleProgress ?? null;
}

/* --------------------- REGISTRO DE RESPOSTAS --------------------- */

export async function registerCorrect(userId: string, progressId: string) {
  const GET = `query GetProgress($id: ID!) {
    getModuleProgress(id: $id) { id correct wrong errorDetails }
  }`;

  const data = await graphqlRequest<any>(GET, { id: progressId }, "GetProgress");
  if (!data?.getModuleProgress) return null;

  const cur = data.getModuleProgress;
  const newCorrect = (cur.correct || 0) + 1;
  const total = newCorrect + (cur.wrong || 0);
  const accuracy = total > 0 ? newCorrect / total : 0;

  await updateModuleProgressRaw({ id: progressId, correct: newCorrect, accuracy });

  const user = await getUserById(userId);
  const newCoins = (user?.coins || 0) + 15;
  await updateUserRaw({ id: userId, coins: newCoins });

  return { newCorrect, accuracy, newCoins };
}

export async function registerWrong(userId: string, progressId: string, errorDetail: ErrorDetail) {
  const GET = `query GetProgress($id: ID!) {
    getModuleProgress(id: $id) { id correct wrong errorDetails }
  }`;

  const data = await graphqlRequest<any>(GET, { id: progressId }, "GetProgress");
  if (!data?.getModuleProgress) return null;

  const cur = data.getModuleProgress;
  const newWrong = (cur.wrong || 0) + 1;
  const total = (cur.correct || 0) + newWrong;
  const accuracy = total > 0 ? (cur.correct || 0) / total : 0;
  const newErrors = [...(cur.errorDetails || []), errorDetail];

  await updateModuleProgressRaw({ id: progressId, wrong: newWrong, accuracy, errorDetails: newErrors });
  return { newWrong, accuracy, newErrors };
}

/* --------------------- FINALIZAR MÓDULO --------------------- */

export async function finishModule(
  userId: string,
  progressId: string,
  moduleNumber: number,
  durationSec: number,
  moduleId: string,
  achievementTitle: string
) {
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

  // ✅ agora adiciona o módulo ao array em vez de string "x/3"
  const newModulesCompleted = [...(user.modulesCompleted || []), moduleNumber];

  const newAchievements = [
    ...(user.achievements?.items || []),
    { id: `temp-${Date.now()}`, title: achievementTitle, createdAt: new Date().toISOString() },
  ];

  await updateUserRaw({
    id: userId,
    points: newPoints,
    modulesCompleted: newModulesCompleted,
    achievements: newAchievements,
  });

  return { newPoints, newModulesCompleted, newAchievements };
}

/* --------------------- BLOQUEIO DE MÓDULOS --------------------- */

export async function canStartModule(userId: string, moduleNumber: number) {
  if (moduleNumber <= 1) return true;

  const LIST = `query ListProgress($filter: ModelModuleProgressFilterInput) {
    listModuleProgresses(filter: $filter) {
      items { id userId moduleId moduleNumber finished }
    }
  }`;

  const filter = { userId: { eq: userId }, moduleNumber: { eq: moduleNumber - 1 } };
  const data = await graphqlRequest<any>(LIST, { filter }, "ListProgress");

  const item = data?.listModuleProgresses?.items?.[0];
  return !!item && item.finished === true;
}
