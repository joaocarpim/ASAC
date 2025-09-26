// index.js
/* Amplify Params - DO NOT EDIT
   AUTH_ASAC2F4153AA_USERPOOLID
   REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const REGION = process.env.REGION || "us-east-1";
const client = new CognitoIdentityProviderClient({ region: REGION });

exports.handler = async (event) => {
  console.log("📩 Evento recebido:", JSON.stringify(event, null, 2));

  // Cabeçalhos CORS completos
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Content-Type": "application/json",
  };

  // Pré-flight (quando o navegador envia OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Campos obrigatórios: email, name, password" }),
      };
    }

    const userPoolId = process.env.AUTH_ASAC2F4153AA_USERPOOLID;
    if (!userPoolId) {
      throw new Error("UserPoolId não configurado (AUTH_ASAC2F4153AA_USERPOOLID).");
    }

    const username = email.toLowerCase();

    // 1) Cria usuário (suprime envio de email)
    const createParams = {
      UserPoolId: userPoolId,
      Username: username,
      TemporaryPassword: password,
      UserAttributes: [
        { Name: "email", Value: username },
        { Name: "name", Value: name },
        { Name: "email_verified", Value: "true" },
      ],
      MessageAction: "SUPPRESS",
    };

    try {
      await client.send(new AdminCreateUserCommand(createParams));
      console.log("✅ Usuário criado:", username);
    } catch (err) {
      const code = err?.name || err?.Code || "";
      console.warn("⚠️ adminCreateUser erro:", code, err?.message);
      if (code !== "UsernameExistsException") {
        throw err;
      }
      console.log("Usuário já existe, seguirá para definir senha:", username);
    }

    // 2) Define a senha como permanente
    const setPwdParams = {
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    };
    await client.send(new AdminSetUserPasswordCommand(setPwdParams));
    console.log("🔑 Senha permanente definida para:", username);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Usuário criado/atualizado com sucesso.",
      }),
    };
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || "Erro interno" }),
    };
  }
};
