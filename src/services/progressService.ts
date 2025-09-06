// src/services/progressService.ts
import { generateClient } from "aws-amplify/api";

type ErrorDetail = {
  questionId: string;
  questionText?: string;
  userAnswer?: string;
  expectedAnswer?: string;
};

const client = generateClient();

export async function ensureUserExistsInDB(userId: string, username?: string, email?: string) {
  const GET_USER = /* GraphQL */ `
    query GetUser($id: ID!) {
      getUser(id: $id) {
        id name email role coins points modulesCompleted precision correctAnswers timeSpent achievements
      }
    }
  `;
  const CREATE_USER = /* GraphQL */ `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id name email role coins points modulesCompleted precision correctAnswers timeSpent achievements
      }
    }
  `;

  const res: any = await client.graphql({
    query: GET_USER,
    variables: { id: userId },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });

  if (res.data?.getUser) return res.data.getUser;

  const input = {
    id: userId,
    name: username ?? "Usuário",
    email: email ?? "",
    role: "User",
    coins: 0,
    points: 0,
    modulesCompleted: "0/3",
    precision: "0%",
    correctAnswers: 0,
    timeSpent: "0s",
    achievements: [],
  };

  const createRes: any = await client.graphql({
    query: CREATE_USER,
    variables: { input },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return createRes.data.createUser;
}

export async function getUserById(userId: string) {
  const GET_USER = /* GraphQL */ `
    query GetUser($id: ID!) {
      getUser(id: $id) {
        id name email role coins points modulesCompleted precision correctAnswers timeSpent achievements
      }
    }
  `;
  const res: any = await client.graphql({
    query: GET_USER,
    variables: { id: userId },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return res.data?.getUser ?? null;
}

export async function getModuleProgressByUser(userId: string, moduleId: string) {
  const QUERY = /* GraphQL */ `
    query ModuleProgressByUser($userId: ID!, $moduleId: ID!) {
      moduleProgressByUser(userId: $userId, moduleId: $moduleId) {
        items {
          id userId moduleId moduleNumber correct wrong accuracy durationSec finished startedAt finishedAt errorDetails
        }
      }
    }
  `;
  const res: any = await client.graphql({
    query: QUERY,
    variables: { userId, moduleId },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return res.data?.moduleProgressByUser?.items?.[0] ?? null;
}

export async function createModuleProgress(userId: string, moduleId: string, moduleNumber: number) {
  const MUT = /* GraphQL */ `
    mutation CreateModuleProgress($input: CreateModuleProgressInput!) {
      createModuleProgress(input: $input) {
        id userId moduleId moduleNumber correct wrong accuracy durationSec finished startedAt
      }
    }
  `;
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
  const res: any = await client.graphql({
    query: MUT,
    variables: { input },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return res.data.createModuleProgress;
}

export async function ensureModuleProgress(userId: string, moduleId: string, moduleNumber: number) {
  const existing = await getModuleProgressByUser(userId, moduleId);
  if (existing) return existing;
  return createModuleProgress(userId, moduleId, moduleNumber);
}

async function updateModuleProgressRaw(input: any) {
  const MUT = /* GraphQL */ `
    mutation UpdateModuleProgress($input: UpdateModuleProgressInput!) {
      updateModuleProgress(input: $input) {
        id userId moduleId moduleNumber correct wrong accuracy durationSec finished finishedAt errorDetails
      }
    }
  `;
  const res: any = await client.graphql({
    query: MUT,
    variables: { input },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return res.data.updateModuleProgress;
}

async function updateUserRaw(input: any) {
  const MUT = /* GraphQL */ `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id coins points modulesCompleted achievements
      }
    }
  `;
  const res: any = await client.graphql({
    query: MUT,
    variables: { input },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  return res.data.updateUser;
}

export async function registerCorrect(userId: string, progressId: string) {
  // increment correct, recalc accuracy
  const GET = /* GraphQL */ `
    query GetProgress($id: ID!) {
      getModuleProgress(id: $id) {
        id correct wrong errorDetails
      }
    }
  `;
  const getRes: any = await client.graphql({
    query: GET,
    variables: { id: progressId },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  const cur = getRes.data.getModuleProgress;
  const newCorrect = (cur.correct || 0) + 1;
  const total = newCorrect + (cur.wrong || 0);
  const accuracy = total > 0 ? newCorrect / total : 0;

  await updateModuleProgressRaw({ id: progressId, correct: newCorrect, accuracy });

  // add 15 coins to user
  const user = await getUserById(userId);
  const newCoins = (user?.coins || 0) + 15;
  await updateUserRaw({ id: userId, coins: newCoins });
  return { newCorrect, accuracy, newCoins };
}

export async function registerWrong(userId: string, progressId: string, errorDetail: ErrorDetail) {
  const GET = /* GraphQL */ `
    query GetProgress($id: ID!) {
      getModuleProgress(id: $id) {
        id correct wrong errorDetails
      }
    }
  `;
  const getRes: any = await client.graphql({
    query: GET,
    variables: { id: progressId },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  const cur = getRes.data.getModuleProgress;
  const newWrong = (cur.wrong || 0) + 1;
  const total = (cur.correct || 0) + newWrong;
  const accuracy = total > 0 ? (cur.correct || 0) / total : 0;
  const newErrors = [...(cur.errorDetails || []), errorDetail];

  await updateModuleProgressRaw({ id: progressId, wrong: newWrong, accuracy, errorDetails: newErrors });
  return { newWrong, accuracy, newErrors };
}

export async function finishModule(userId: string, progressId: string, moduleNumber: number, durationSec: number, moduleId: string, achievementTitle: string) {
  // mark progress finished and set duration
  await updateModuleProgressRaw({ id: progressId, finished: true, durationSec, finishedAt: new Date().toISOString() });

  // update user: +12250 points, increment modulesCompleted count, add achievement
  const user = await getUserById(userId);
  const currentPoints = user?.points || 0;
  const newPoints = currentPoints + 12250;

  // modulesCompleted field assumed "X/Y"
  const modulesCompletedStr = user?.modulesCompleted || "0/3";
  const parts = modulesCompletedStr.split("/").map((p: string) => parseInt(p || "0", 10));
  const completed = Math.max(0, parts[0] || 0) + 1;
  const total = parts[1] || 3;
  const newModulesCompleted = `${completed}/${total}`;

  const newAchievements = [...(user?.achievements || []), { moduleId, title: achievementTitle, earnedAt: new Date().toISOString() }];

  await updateUserRaw({ id: userId, points: newPoints, modulesCompleted: newModulesCompleted, achievements: newAchievements });

  return { newPoints, newModulesCompleted, newAchievements };
}

/**
 * Verifica se o usuário pode iniciar o módulo `moduleNumber`.
 * Regras: módulo 1 sempre liberado. Para módulo N>1, o módulo N-1 deve ter progress.finished === true
 */
export async function canStartModule(userId: string, moduleNumber: number, _moduleIdPrev?: string) {
  if (moduleNumber <= 1) return true;
  // find previous module progress: query listModuleProgresses filtering by userId and moduleNumber = moduleNumber-1
  const LIST = /* GraphQL */ `
    query ListProgress($filter: ModelModuleProgressFilterInput) {
      listModuleProgresses(filter: $filter) {
        items { id userId moduleId moduleNumber finished }
      }
    }
  `;
  const filter = { userId: { eq: userId }, moduleNumber: { eq: moduleNumber - 1 } };
  const res: any = await client.graphql({
    query: LIST,
    variables: { filter },
    authMode: ("AMAZON_COGNITO_USER_POOLS" as any),
  });
  const item = res.data?.listModuleProgresses?.items?.[0];
  return !!item && item.finished === true;
}
