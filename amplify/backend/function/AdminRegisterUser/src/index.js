/* Amplify Params - DO NOT EDIT
    API_ASAC_GRAPHQLAPIENDPOINTOUTPUT
    API_ASAC_GRAPHQLAPIIDOUTPUT
    API_ASAC_GRAPHQLAPIKEYOUTPUT
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

const REGION = process.env.REGION || "us-east-1";
const USER_POOL_ID = process.env.AUTH_ASAC2F4153AA_USERPOOLID;
const GRAPHQL_URL = process.env.API_ASAC_GRAPHQLAPIENDPOINTOUTPUT;
const API_KEY = process.env.API_ASAC_GRAPHQLAPIKEYOUTPUT;

const cognito = new CognitoIdentityProviderClient({ region: REGION });

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

    // 1. Criar usuário no Cognito
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

    // 2. Definir senha permanente
    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: trimmedPassword,
        Permanent: true,
      })
    );
    console.log("🔑 Senha permanente definida:", username);

    // 3. Obter o 'sub' (ID) do usuário
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

    // 4. Criar no DynamoDB
    if (GRAPHQL_URL && userSub) {
      if (!API_KEY)
        throw new Error("API_ASAC_GRAPHQLAPIKEYOUTPUT não definida.");

      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) { 
            id 
            name 
            email 
            role 
            coins
            points
          }
        }
      `;

      // ✅ CORREÇÃO: Baseado no schema.graphql
      const createUserInput = {
        id: userSub,
        name: trimmedName,
        email: username,
        role: "user",
        coins: 0,
        points: 0,
        modulesCompleted: [], // ✅ Array vazio de Int
        currentModule: 1,
        precision: 0.0, // ✅ Float
        correctAnswers: 0,
        wrongAnswers: 0,
        timeSpent: 0.0, // ✅ Float
      };

      try {
        console.log(
          "📡 Enviando requisição GraphQL com input:",
          JSON.stringify(createUserInput, null, 2)
        );

        // ✅ CORREÇÃO: Usar o token do admin que chamou a Lambda
        const authToken = event.identity?.claims
          ? event.request?.headers?.authorization || ""
          : "";

        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken, // ✅ Usa o token do Admin
          },
          body: JSON.stringify({
            query: mutation,
            variables: { input: createUserInput },
          }),
        });

        const gqlJson = await response.json();

        console.log(
          "📥 Resposta GraphQL completa:",
          JSON.stringify(gqlJson, null, 2)
        );

        if (gqlJson.errors) {
          console.error(
            "⚠️ Erro GraphQL:",
            JSON.stringify(gqlJson.errors, null, 2)
          );
          const firstErrorMessage =
            gqlJson.errors[0].message || "Erro desconhecido no DynamoDB";
          throw new Error(`Falha ao inserir no DynamoDB: ${firstErrorMessage}`);
        }

        console.log(
          "✅ Usuário gravado no DynamoDB:",
          gqlJson.data?.createUser
        );
      } catch (fetchError) {
        console.error("❌ Erro ao chamar GraphQL:", fetchError);
        throw new Error(`Erro no fetch do GraphQL: ${fetchError.message}`);
      }
    }

    const result = {
      success: true,
      message: "Usuário criado com sucesso.",
      sub: userSub,
    };
    console.log("✅ Retornando resultado:", result);
    return JSON.stringify(result);
  } catch (error) {
    console.error("❌ Erro fatal ao criar usuário:", error);
    throw new Error(error.message || "Erro interno ao criar usuário");
  }
};
