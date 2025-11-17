// src/services/deleteUserService.ts

import { generateClient } from "aws-amplify/api";

const client = generateClient();

// ============================================================
// MUTATIONS E QUERIES
// ============================================================

const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(input: { id: $id }) {
      id
      name
      email
    }
  }
`;

const DELETE_COGNITO_USER = `
  mutation AdminDeleteCognitoUser($username: String!, $userId: String) {
    adminDeleteCognitoUser(username: $username, userId: $userId)
  }
`;

const DELETE_PROGRESS = `
  mutation DeleteProgress($id: ID!) {
    deleteProgress(input: { id: $id }) {
      id
    }
  }
`;

const DELETE_ACHIEVEMENT = `
  mutation DeleteAchievement($id: ID!) {
    deleteAchievement(input: { id: $id }) {
      id
    }
  }
`;

const LIST_PROGRESSES = `
  query ListProgresses($filter: ModelProgressFilterInput) {
    listProgresses(filter: $filter) {
      items {
        id
        userId
        moduleId
      }
    }
  }
`;

const LIST_ACHIEVEMENTS = `
  query ListAchievements($filter: ModelAchievementFilterInput) {
    listAchievements(filter: $filter) {
      items {
        id
        userId
        title
      }
    }
  }
`;

// ============================================================
// TIPOS
// ============================================================

interface DeleteUserResponse {
  deleteUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface DeleteCognitoLambdaResult {
  success: boolean;
  deletedFromCognito: boolean;
  deletedFromDynamoDB: boolean;
  cognitoUsername?: string | null;
  userId?: string | null;
}

interface DeleteCognitoResponse {
  adminDeleteCognitoUser: string; // AWSJSON (stringificado)
}

interface ProgressItem {
  id: string;
  userId: string;
  moduleId: string;
}

interface AchievementItem {
  id: string;
  userId: string;
  title: string;
}

export interface DeleteUserCompletelyResult {
  success: boolean;
  deletedProgresses: number;
  deletedAchievements: number;
  cognitoDeleted: boolean;
  dbDeleted: boolean;
}

// ============================================================
// SERVIÇO COMPLETO DE DELEÇÃO
// ============================================================

export const deleteUserService = {
  /**
   * Chama a Lambda via GraphQL para deletar usuário do Cognito
   */
  async deleteCognitoUser(
    email: string,
    userId?: string
  ): Promise<{
    cognitoDeleted: boolean;
    lambdaRaw?: DeleteCognitoLambdaResult | null;
  }> {
    console.log(
      `[deleteUserService] 🗑️ Deletando usuário do Cognito (Lambda): ${email}`
    );

    try {
      const response = (await client.graphql({
        query: DELETE_COGNITO_USER,
        variables: { username: email, userId },
        authMode: "userPool",
      })) as { data: DeleteCognitoResponse; errors?: any[] };

      if (response.errors && response.errors.length > 0) {
        const errorMsg = response.errors[0].message || "Erro desconhecido";
        // Se retornar UserNotFoundException, considera sucesso
        if (errorMsg.includes("UserNotFoundException")) {
          console.warn(
            `[deleteUserService] ⚠️ Usuário ${email} não existe no Cognito`
          );
          return { cognitoDeleted: true, lambdaRaw: null };
        }
        throw new Error(errorMsg);
      }

      const raw = response.data.adminDeleteCognitoUser;
      let parsed: DeleteCognitoLambdaResult | null = null;
      try {
        parsed = raw ? (JSON.parse(raw) as DeleteCognitoLambdaResult) : null;
      } catch {
        parsed = null;
      }

      const cognitoDeleted = parsed?.deletedFromCognito ?? true;

      console.log(
        `[deleteUserService] ✅ Lambda adminDeleteCognitoUser executada (cognitoDeleted = ${cognitoDeleted})`
      );

      return { cognitoDeleted, lambdaRaw: parsed };
    } catch (error: any) {
      console.error(
        `[deleteUserService] ❌ Erro ao deletar do Cognito (Lambda):`,
        error
      );

      if (error.message?.includes("UserNotFoundException")) {
        console.warn(
          `[deleteUserService] ⚠️ Usuário não existe no Cognito, continuando...`
        );
        return { cognitoDeleted: true, lambdaRaw: null };
      }

      throw error;
    }
  },

  /**
   * Busca todos os progressos de um usuário
   */
  async getUserProgresses(userId: string): Promise<ProgressItem[]> {
    console.log(
      `[deleteUserService] 🔍 Buscando progressos do usuário: ${userId}`
    );

    const response: any = await client.graphql({
      query: LIST_PROGRESSES,
      variables: {
        filter: { userId: { eq: userId } },
      },
      authMode: "userPool",
    });

    const items = response.data?.listProgresses?.items || [];
    console.log(
      `[deleteUserService] ✅ Encontrados ${items.length} progressos`
    );
    return items;
  },

  /**
   * Busca todas as conquistas de um usuário
   */
  async getUserAchievements(userId: string): Promise<AchievementItem[]> {
    console.log(
      `[deleteUserService] 🔍 Buscando conquistas do usuário: ${userId}`
    );

    const response: any = await client.graphql({
      query: LIST_ACHIEVEMENTS,
      variables: {
        filter: { userId: { eq: userId } },
      },
      authMode: "userPool",
    });

    const items = response.data?.listAchievements?.items || [];
    console.log(
      `[deleteUserService] ✅ Encontradas ${items.length} conquistas`
    );
    return items;
  },

  /**
   * Deleta um progresso específico
   */
  async deleteProgress(progressId: string): Promise<void> {
    try {
      await client.graphql({
        query: DELETE_PROGRESS,
        variables: { id: progressId },
        authMode: "userPool",
      });
    } catch (error: any) {
      console.error(
        `[deleteUserService] ❌ Erro ao deletar progresso ${progressId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Deleta uma conquista específica
   */
  async deleteAchievement(achievementId: string): Promise<void> {
    try {
      await client.graphql({
        query: DELETE_ACHIEVEMENT,
        variables: { id: achievementId },
        authMode: "userPool",
      });
    } catch (error: any) {
      console.error(
        `[deleteUserService] ❌ Erro ao deletar conquista ${achievementId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Deleta um usuário do DynamoDB
   */
  async deleteUserFromDB(userId: string): Promise<boolean> {
    console.log(
      `[deleteUserService] 🗑️ Deletando usuário do DynamoDB: ${userId}`
    );

    try {
      const response = (await client.graphql({
        query: DELETE_USER,
        variables: { id: userId },
        authMode: "userPool",
      })) as { data: DeleteUserResponse };

      console.log(
        `[deleteUserService] ✅ Usuário deletado do DynamoDB:`,
        response.data
      );
      return true;
    } catch (error: any) {
      console.error(
        `[deleteUserService] ❌ Erro ao deletar do DynamoDB:`,
        error
      );
      throw error;
    }
  },

  /**
   * 🔥 FUNÇÃO PRINCIPAL - Deleta o usuário completamente
   * Ordem: Progressos → Conquistas → Cognito (Lambda) → DynamoDB
   */
  async deleteUserCompletely(
    userId: string,
    email: string
  ): Promise<DeleteUserCompletelyResult> {
    console.log("═".repeat(80));
    console.log(`[deleteUserService] 🔥 INÍCIO DA DELEÇÃO COMPLETA`);
    console.log(`[deleteUserService] UserID: ${userId}`);
    console.log(`[deleteUserService] Email: ${email}`);

    const result: DeleteUserCompletelyResult = {
      success: false,
      deletedProgresses: 0,
      deletedAchievements: 0,
      cognitoDeleted: false,
      dbDeleted: false,
    };

    try {
      // ========== ETAPA 1: BUSCAR PROGRESSOS ==========
      console.log("─".repeat(80));
      console.log(`[deleteUserService] ETAPA 1: Buscando progressos...`);

      const progresses = await this.getUserProgresses(userId);
      console.log(
        `[deleteUserService] Total de progressos: ${progresses.length}`
      );

      // ========== ETAPA 2: BUSCAR CONQUISTAS ==========
      console.log("─".repeat(80));
      console.log(`[deleteUserService] ETAPA 2: Buscando conquistas...`);

      const achievements = await this.getUserAchievements(userId);
      console.log(
        `[deleteUserService] Total de conquistas: ${achievements.length}`
      );

      // ========== ETAPA 3: DELETAR PROGRESSOS ==========
      console.log("─".repeat(80));
      console.log(`[deleteUserService] ETAPA 3: Deletando progressos...`);

      if (progresses.length > 0) {
        const progressDeletions = progresses.map((p) =>
          this.deleteProgress(p.id)
        );
        await Promise.all(progressDeletions);
        result.deletedProgresses = progresses.length;
        console.log(
          `[deleteUserService] ✅ ${progresses.length} progressos deletados`
        );
      } else {
        console.log(`[deleteUserService] ⚠️ Nenhum progresso para deletar`);
      }

      // ========== ETAPA 4: DELETAR CONQUISTAS ==========
      console.log("─".repeat(80));
      console.log(`[deleteUserService] ETAPA 4: Deletando conquistas...`);

      if (achievements.length > 0) {
        const achievementDeletions = achievements.map((a) =>
          this.deleteAchievement(a.id)
        );
        await Promise.all(achievementDeletions);
        result.deletedAchievements = achievements.length;
        console.log(
          `[deleteUserService] ✅ ${achievements.length} conquistas deletadas`
        );
      } else {
        console.log(`[deleteUserService] ⚠️ Nenhuma conquista para deletar`);
      }

      // ========== ETAPA 5: DELETAR DO COGNITO (LAMBDA) ==========
      console.log("─".repeat(80));
      console.log(
        `[deleteUserService] ETAPA 5: Deletando do Cognito (Lambda)...`
      );

      try {
        const cognitoRes = await this.deleteCognitoUser(email, userId);
        result.cognitoDeleted = cognitoRes.cognitoDeleted;
        console.log(
          `[deleteUserService] ✅ Cognito: ${
            result.cognitoDeleted ? "deletado" : "não confirmado"
          }`
        );
      } catch (cognitoError: any) {
        console.error(
          `[deleteUserService] ❌ Erro no Cognito (continuando):`,
          cognitoError.message
        );
        result.cognitoDeleted = false;
      }

      // ========== ETAPA 6: DELETAR DO DYNAMODB ==========
      console.log("─".repeat(80));
      console.log(`[deleteUserService] ETAPA 6: Deletando do DynamoDB...`);

      result.dbDeleted = await this.deleteUserFromDB(userId);
      console.log(
        `[deleteUserService] ✅ DynamoDB: ${
          result.dbDeleted ? "deletado" : "falhou"
        }`
      );

      // ========== RESULTADO FINAL ==========
      result.success = result.dbDeleted;

      console.log("─".repeat(80));
      console.log(`[deleteUserService] 🎉 DELEÇÃO COMPLETA FINALIZADA`);
      console.log(
        `[deleteUserService] Resultado:`,
        JSON.stringify(result, null, 2)
      );
      console.log("═".repeat(80));

      return result;
    } catch (error: any) {
      console.log("═".repeat(80));
      console.error(`[deleteUserService] 🔴 ERRO FATAL NA DELEÇÃO:`, error);
      console.log("═".repeat(80));
      throw error;
    }
  },
};

export default deleteUserService;
