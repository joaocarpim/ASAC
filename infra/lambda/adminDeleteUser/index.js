/* Amplify Params - DO NOT EDIT
  AUTH_ASAC2F4153AA_USERPOOLID
  API_ASAC_USERTABLE_NAME
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
  ListUsersCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.REGION || process.env.AWS_REGION;
const USER_POOL_ID = process.env.AUTH_ASAC2F4153AA_USERPOOLID;
const USER_TABLE_NAME = process.env.API_ASAC_USERTABLE_NAME;

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// =============================================================
// 🔥 FUNÇÃO PRINCIPAL
// =============================================================
exports.handler = async (event) => {
  console.log("📥 EVENT:", JSON.stringify(event, null, 2));

  const { username, userId } = event.arguments || {};

  if (!username) {
    const resp = {
      success: false,
      error: "username (email) é obrigatório",
    };
    console.log("⚠️ Resposta:", JSON.stringify(resp));
    return JSON.stringify(resp);
  }

  // =============================================================
  // 🔥 ETAPA 1 — Buscar SUB real no Cognito
  // =============================================================
  console.log("🔍 Buscando usuário no Cognito pelo email:", username);

  let cognitoUsername = null;

  try {
    const listCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Filter: `email = "${username}"`,
      Limit: 1,
    });

    const listResult = await cognitoClient.send(listCommand);
    console.log("📦 Resultado ListUsers:", JSON.stringify(listResult, null, 2));

    if (listResult.Users && listResult.Users.length > 0) {
      cognitoUsername = listResult.Users[0].Username;
      console.log("✅ Encontrado no Cognito → SUB:", cognitoUsername);
    } else {
      console.log("⚠️ Nenhum usuário encontrado no Cognito com esse email");
    }
  } catch (err) {
    console.error("❌ ERRO buscando usuário no Cognito:", err);
  }

  // =============================================================
  // 🔥 ETAPA 2 — Deletar no Cognito (Só se achou o SUB)
  // =============================================================
  let cognitoDeleted = false;

  if (cognitoUsername) {
    try {
      const deleteCmd = new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: cognitoUsername,
      });

      await cognitoClient.send(deleteCmd);
      console.log("🔥 Usuário deletado do Cognito com sucesso!");

      cognitoDeleted = true;
    } catch (err) {
      console.error("❌ Falha ao deletar do Cognito:", err);
    }
  } else {
    console.log(
      "⚠️ Cognito: não foi possível deletar porque não encontramos o usuário"
    );
  }

  // =============================================================
  // 🔥 ETAPA 3 — Buscar userId pelo email (se não veio)
  // =============================================================
  let finalUserId = userId ?? null;

  if (!finalUserId) {
    try {
      console.log("🔍 Buscando userId no DynamoDB pelo email:", username);

      const queryRes = await docClient.send(
        new QueryCommand({
          TableName: USER_TABLE_NAME,
          IndexName: "byEmail",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": username,
          },
        })
      );

      console.log(
        "📦 Resultado Query byEmail:",
        JSON.stringify(queryRes, null, 2)
      );

      if (queryRes.Items?.length) {
        finalUserId = queryRes.Items[0].id;
        console.log("🔐 userId encontrado no Dynamo:", finalUserId);
      } else {
        console.log(
          "⚠️ Nenhum registro de usuário encontrado no DynamoDB para esse email"
        );
      }
    } catch (err) {
      console.error("❌ ERRO buscando userId no DynamoDB:", err);
    }
  }

  // =============================================================
  // 🔥 ETAPA 4 — Deletar do DynamoDB (caso queira que a Lambda faça)
  // =============================================================
  let dynamoDeleted = false;

  if (finalUserId) {
    try {
      console.log("🗑️ Deletando usuário do DynamoDB:", finalUserId);

      await docClient.send(
        new DeleteCommand({
          TableName: USER_TABLE_NAME,
          Key: { id: finalUserId },
        })
      );
      console.log("🗑️ Deletado do DynamoDB com sucesso:", finalUserId);
      dynamoDeleted = true;
    } catch (err) {
      console.error("❌ Erro ao deletar do DynamoDB:", err);
    }
  } else {
    console.log(
      "⚠️ DynamoDB: não foi possível deletar porque não temos o userId"
    );
  }

  // =============================================================
  // 🔥 RESPOSTA FINAL
  // =============================================================
  const response = {
    success: true,
    deletedFromCognito: cognitoDeleted,
    deletedFromDynamoDB: dynamoDeleted,
    cognitoUsername,
    userId: finalUserId,
  };

  console.log("✅ RESPOSTA FINAL:", JSON.stringify(response, null, 2));

  // AppSync com retorno AWSJSON espera string
  return JSON.stringify(response);
};
