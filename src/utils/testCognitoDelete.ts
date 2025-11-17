// src/utils/testCognitoDelete.ts
// Script de teste para verificar se a deleção do Cognito está funcionando

import { generateClient } from "aws-amplify/api";

const client = generateClient();

/**
 * Testa a deleção de um usuário do Cognito via Lambda
 * Use este script para debugar problemas de deleção
 */
export async function testCognitoDelete(email: string, userId?: string) {
  console.log("═".repeat(80));
  console.log("🧪 [TEST] TESTE DE DELEÇÃO DO COGNITO");
  console.log(`📧 Email: ${email}`);
  console.log(`🆔 UserID: ${userId || "não fornecido"}`);
  console.log("─".repeat(80));

  try {
    const query = `
      mutation AdminDeleteCognitoUser($username: String!, $userId: String) {
        adminDeleteCognitoUser(username: $username, userId: $userId)
      }
    `;

    console.log("📤 Enviando requisição para Lambda...");

    const response: any = await client.graphql({
      query,
      variables: {
        username: email,
        userId: userId || null,
      },
      authMode: "userPool",
    });

    console.log("📥 Resposta recebida:");
    console.log("─".repeat(80));
    console.log(JSON.stringify(response, null, 2));
    console.log("─".repeat(80));

    // Parse da resposta
    if (response.errors && response.errors.length > 0) {
      console.error("❌ ERRO GraphQL:", response.errors);
      return {
        success: false,
        error: response.errors[0].message,
      };
    }

    const lambdaResult = response.data?.adminDeleteCognitoUser;
    console.log("📦 Resultado da Lambda (raw):", lambdaResult);

    // Parse do JSON
    let parsedResult: any = {};
    if (typeof lambdaResult === "string") {
      try {
        parsedResult = JSON.parse(lambdaResult);
        console.log(
          "✅ Resultado parseado:",
          JSON.stringify(parsedResult, null, 2)
        );
      } catch (e) {
        console.error("❌ Erro ao parsear JSON:", e);
        parsedResult = { error: "Não foi possível parsear resposta" };
      }
    } else {
      parsedResult = lambdaResult;
    }

    console.log("─".repeat(80));
    console.log("📊 RESUMO:");
    console.log(`  • Sucesso: ${parsedResult.success ? "✅" : "❌"}`);
    console.log(
      `  • Deletado do Cognito: ${
        parsedResult.deletedFromCognito ? "✅" : "❌"
      }`
    );
    console.log(
      `  • Deletado do DynamoDB: ${
        parsedResult.deletedFromDynamoDB ? "✅" : "❌"
      }`
    );

    if (parsedResult.error) {
      console.log(`  • Erro: ${parsedResult.error}`);
    }

    console.log("═".repeat(80));

    return parsedResult;
  } catch (error: any) {
    console.error("═".repeat(80));
    console.error("❌ ERRO FATAL NO TESTE:");
    console.error(error);
    console.error("═".repeat(80));
    throw error;
  }
}

// Exemplo de uso:
// import { testCognitoDelete } from './utils/testCognitoDelete';
// await testCognitoDelete('kiwi@gmail.com', '14c81448-40a1-70f5-cf26-3f0ce10a9c4a');
