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

    if (!email || !name || !password) {
      throw new Error("Campos obrigatórios: email, name, password");
    }

    const username = email.toLowerCase();

    // 1️⃣ Criar usuário no Cognito
    try {
      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          TemporaryPassword: password,
          UserAttributes: [
            { Name: "email", Value: username },
            { Name: "name", Value: name },
            { Name: "email_verified", Value: "true" },
          ],
          MessageAction: "SUPPRESS",
        })
      );
      console.log("✅ Cognito: usuário criado:", username);
    } catch (err) {
      if ((err?.name || err?.Code) !== "UsernameExistsException") throw err;
      console.log("⚠️ Usuário já existe, definindo senha permanente.");
    }

    // 2️⃣ Definir senha permanente
    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: true,
      })
    );
    console.log("🔑 Senha permanente definida:", username);

    // 3️⃣ Obter o sub (ID) do usuário Cognito
    const getUserResp = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username })
    );

    const subAttr = getUserResp.UserAttributes.find((attr) => attr.Name === "sub");
    const userSub = subAttr ? subAttr.Value : null;
    console.log("🆔 Sub Cognito do novo usuário:", userSub);

    // 4️⃣ Criar o registro no DynamoDB via AppSync GraphQL (USANDO API KEY)
    if (GRAPHQL_URL && userSub) {

      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
            role
            modulesCompleted
            currentModule
          }
        }
      `;

      try {
        console.log("📡 Enviando requisição GraphQL...");

        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY, // ✅ Garantido sempre
          },
          body: JSON.stringify({
            query: mutation,
            variables: {
              input: {
                id: userSub,
                name,
                email: username,
                role: "user",
                coins: 0,
                points: 0,
                modulesCompleted: [],
                currentModule: 1,
                precision: 0.0,
                correctAnswers: 0,
                wrongAnswers: 0,
                timeSpent: 0.0,
              },
            },
          }),
        });

        const gqlJson = await response.json();

        if (gqlJson.errors) {
          console.error("⚠️ Erro GraphQL:", JSON.stringify(gqlJson.errors, null, 2));
          const firstErr = gqlJson.errors[0]?.message || "Erro desconhecido no GraphQL";
          throw new Error(firstErr);
        }

        console.log("✅ Usuário gravado no DynamoDB:", gqlJson.data?.createUser);

      } catch (fetchError) {
        console.error("❌ Erro ao chamar GraphQL:", fetchError);
        console.warn("⚠️ Usuário criado no Cognito mas falhou no DynamoDB");
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
    console.error("❌ Erro ao criar usuário:", error);
    throw new Error(error?.message || "Erro interno ao criar usuário");
  }
};
