// src/services/DeleteUserService.ts
import { generateClient } from "aws-amplify/api";
import {
  deleteUser as deleteUserMutation,
  adminDeleteCognitoUser,
  deleteProgress,
  deleteAchievement,
} from "../graphql/mutations";
import { listProgresses, listAchievements } from "../graphql/queries";

const client = generateClient();

// ============================================================
// TIPOS
// ============================================================
export interface DeleteUserCompletelyResult {
  success: boolean;
  deletedProgresses: number;
  deletedAchievements: number;
  cognitoDeleted: boolean;
  dbDeleted: boolean;
}

export const deleteUserService = {
  async deleteUserCompletely(userId: string, userEmail: string) {
    console.log(`🚀 [Service] Iniciando exclusão completa de: ${userEmail}`);

    try {
      // 1. Buscar Progressos e Conquistas em Paralelo
      // Usamos 'as any' aqui também para evitar conflitos de tipo do Amplify
      const [progressResult, achievementsResult] = await Promise.all([
        client.graphql({
          query: listProgresses,
          variables: { filter: { userId: { eq: userId } } },
          authMode: "userPool",
        }) as any,
        client.graphql({
          query: listAchievements,
          variables: { filter: { userId: { eq: userId } } },
          authMode: "userPool",
        }) as any,
      ]);

      const progressItems = progressResult.data?.listProgresses?.items || [];
      const achievementItems =
        achievementsResult.data?.listAchievements?.items || [];

      console.log(
        `📦 [Service] Encontrados: ${progressItems.length} progressos, ${achievementItems.length} conquistas.`
      );

      // 2. Preparar todas as promessas de exclusão
      const deletions = [
        ...progressItems.map((p: any) =>
          client.graphql({
            query: deleteProgress,
            variables: { input: { id: p.id } },
            authMode: "userPool",
          })
        ),
        ...achievementItems.map((a: any) =>
          client.graphql({
            query: deleteAchievement,
            variables: { input: { id: a.id } },
            authMode: "userPool",
          })
        ),
      ];

      // 3. Executar todas as exclusões de dependências de uma vez
      if (deletions.length > 0) {
        // Cast para 'any[]' para evitar erros de tipagem no Promise.all
        await Promise.all(deletions as any[]);
        console.log("✅ [Service] Dependências apagadas.");
      }

      // 4. Apagar do Cognito e DynamoDB em paralelo
      // ✅ CORREÇÃO DO ERRO: Forçando o tipo para 'any' para o Promise.all aceitar
      const [cognitoResult, dbResult] = await Promise.all([
        client.graphql({
          query: adminDeleteCognitoUser,
          variables: { username: userEmail },
          authMode: "userPool",
        }) as any,
        client.graphql({
          query: deleteUserMutation,
          variables: { input: { id: userId } },
          authMode: "userPool",
        }) as any,
      ]);

      console.log("✅ [Service] Exclusão do usuário finalizada!");

      return {
        success: true,
        deletedProgresses: progressItems.length,
        deletedAchievements: achievementItems.length,
        cognitoDeleted: !!cognitoResult.data?.adminDeleteCognitoUser,
        dbDeleted: !!dbResult.data?.deleteUser,
      };
    } catch (error: any) {
      console.error("❌ [Service] Erro fatal na exclusão:", error);
      throw new Error(error.message || "Falha ao apagar usuário.");
    }
  },
};

export default deleteUserService;
