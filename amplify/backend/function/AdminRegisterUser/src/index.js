// index.js
/* Amplify Params - DO NOT EDIT
   AUTH_ASAC2F4153AA_USERPOOLID
   REGION
   API_ASAC_GRAPHQLAPIENDPOINTOUTPUT
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const fetch = globalThis.fetch;

const REGION = process.env.REGION || "us-east-1";
const USER_POOL_ID = process.env.AUTH_ASAC2F4153AA_USERPOOLID;

const GRAPHQL_URL =
  process.env.API_ASAC_GRAPHQLAPIENDPOINTOUTPUT &&
  process.env.API_ASAC_GRAPHQLAPIENDPOINTOUTPUT.startsWith("http")
    ? process.env.API_ASAC_GRAPHQLAPIENDPOINTOUTPUT
    : "https://izr4ayivprhodgqzf3gm6ijwh4.appsync-api.us-east-1.amazonaws.com/graphql";

const cognito = new CognitoIdentityProviderClient({ region: REGION });

exports.handler = async (event) => {
  console.log("📩 Evento recebido:", JSON.stringify(event, null, 2));

  const headersBase = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headersBase, body: JSON.stringify({ ok: true }) };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return {
        statusCode: 400,
        headers: headersBase,
        body: JSON.stringify({ error: "Campos obrigatórios: email, name, password" }),
      };
    }

    const username = email.toLowerCase();

    // 1️⃣ Criar usuário no Cognito
    try {
      await cognito.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        TemporaryPassword: password,
        UserAttributes: [
          { Name: "email", Value: username },
          { Name: "name", Value: name },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS",
      }));
      console.log("✅ Cognito: usuário criado:", username);
    } catch (err) {
      if ((err?.name || err?.Code) !== "UsernameExistsException") throw err;
      console.log("⚠️ Usuário já existe, definindo senha permanente.");
    }

    // 2️⃣ Definir senha permanente
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: password,
      Permanent: true,
    }));
    console.log("🔑 Senha permanente definida:", username);

    // 3️⃣ Buscar o `sub` do usuário
    const getUserResp = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: username })
    );

    const subAttr = getUserResp.UserAttributes.find(attr => attr.Name === "sub");
    const userSub = subAttr ? subAttr.Value : null;
    console.log("🆔 Sub Cognito do novo usuário:", userSub);

    // 4️⃣ Inserir também no AppSync
    if (GRAPHQL_URL) {
      const adminToken = event.headers?.Authorization || event.headers?.authorization;
      if (!adminToken) {
        console.warn("❗ Nenhum Authorization header recebido, pulando GraphQL");
      } else {
        const mutation = /* GraphQL */ `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              name
              email
              role
            }
          }
        `;

        const gqlResp = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: adminToken,
          },
          body: JSON.stringify({
            query: mutation,
            variables: {
              input: {
                id: userSub,
                name,
                email: username,
                role: "user",
              },
            },
          }),
        });

        const gqlJson = await gqlResp.json();
        if (gqlJson.errors) {
          console.error("⚠️ Erro GraphQL:", JSON.stringify(gqlJson.errors));
          throw new Error("Falha ao inserir no AppSync");
        }
        console.log("✅ Usuário gravado no DynamoDB:", gqlJson.data.createUser);
      }
    }

    return {
      statusCode: 200,
      headers: headersBase,
      body: JSON.stringify({
        success: true,
        message: "Usuário criado com sucesso.",
        sub: userSub, // ✅ retornado ao app
      }),
    };
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    return {
      statusCode: 500,
      headers: headersBase,
      body: JSON.stringify({ error: error?.message || "Erro interno" }),
    };
  }
};
