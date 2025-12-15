/* Amplify Params - DO NOT EDIT
    API_ASAC_GRAPHQLAPIENDPOINTOUTPUT
    API_ASAC_GRAPHQLAPIIDOUTPUT
    API_ASAC_GRAPHQLAPIKEYOUTPUT
    API_ASAC_USERTABLE_NAME
    AUTH_ASAC2F4153AA_USERPOOLID
    ENV
    REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.REGION || "us-east-1";
const USER_POOL_ID = process.env.AUTH_ASAC2F4153AA_USERPOOLID;
const TABLE_NAME =
  process.env.API_ASAC_USERTABLE_NAME || "User-2tmx3fickjczzii57s6dpbavxm-dev";

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  console.log("📩 Evento AppSync recebido:", JSON.stringify(event, null, 2));

  try {
    const { name, email, password } = event.arguments || {};

    const trimmedName = name ? name.trim() : "";
    const trimmedEmail = email ? email.trim() : "";
    const trimmedPassword = password ? password.trim() : "";

    if (!trimmedEmail || !trimmedName || !trimmedPassword) {
      throw new Error(
        "Campos obrigatórios: email, name, password (não podem ser vazios ou só espaços)"
      );
    }
    const username = trimmedEmail.toLowerCase();

    // ============================================
    // 1. CRIAR USUÁRIO NO COGNITO
    // ============================================
    try {
      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          TemporaryPassword: trimmedPassword,
          UserAttributes: [
            { Name: "email", Value: username },
            { Name: "name", Value: trimmedName },
            { Name: "email_verified", Value: "true" },
          ],
          MessageAction: "SUPPRESS",
        })
      );
      console.log("✅ Cognito: usuário criado:", username);
    } catch (err) {
      const errName = err.name || err.Code;
      if (errName !== "UsernameExistsException") {
        throw err;
      }
      console.log("⚠️ Usuário já existe, definindo senha permanente.");
    }

    // ============================================
    // 2. DEFINIR SENHA PERMANENTE
    // ============================================
    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: trimmedPassword,
        Permanent: true,
      })
    );
    console.log("🔑 Senha permanente definida:", username);

    // ============================================
    // 3. OBTER SUB DO USUÁRIO
    // ============================================
    const getUserResp = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username })
    );

    const subAttr = getUserResp.UserAttributes.find(
      (attr) => attr.Name === "sub"
    );
    const userSub = subAttr ? subAttr.Value : null;
    if (!userSub)
      throw new Error("Falha ao obter o ID (sub) do usuário no Cognito.");
    console.log("🆔 Sub Cognito do novo usuário:", userSub);

    // ============================================
    // 4. CRIAR NO DYNAMODB DIRETAMENTE (SEM GRAPHQL!)
    // ============================================
    const timestamp = new Date().toISOString();

    const userItem = {
      id: userSub,
      __typename: "User",
      name: trimmedName,
      email: username,
      role: "user",
      coins: 0,
      points: 0,
      modulesCompleted: [], // Array vazio de Int
      currentModule: 1,
      precision: 0, // Float
      correctAnswers: 0,
      wrongAnswers: 0,
      timeSpent: 0, // Float
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    console.log(
      "💾 Salvando usuário no DynamoDB:",
      JSON.stringify(userItem, null, 2)
    );

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: userItem,
          ConditionExpression: "attribute_not_exists(id)", // Evita duplicação
        })
      );
      console.log("✅ Usuário gravado no DynamoDB com sucesso!");
    } catch (dynamoError) {
      if (dynamoError.name === "ConditionalCheckFailedException") {
        console.warn("⚠️ Usuário já existe no DynamoDB, continuando...");
      } else {
        console.error("❌ Erro ao salvar no DynamoDB:", dynamoError);
        throw new Error(`Falha ao inserir no DynamoDB: ${dynamoError.message}`);
      }
    }

    // ============================================
    // 5. RETORNAR SUCESSO
    // ============================================
    const result = {
      success: true,
      message: "Usuário criado com sucesso.",
      sub: userSub,
      user: userItem,
    };
    console.log("✅ Retornando resultado:", result);
    return JSON.stringify(result);
  } catch (error) {
    console.error("❌ Erro fatal ao criar usuário:", error);
    throw new Error(error.message || "Erro interno ao criar usuário");
  }
};

//TESTE LAMBDA DYNAMO
