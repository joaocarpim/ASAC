/* Amplify Params - DO NOT EDIT
  AUTH_ASAC2F4153AA_USERPOOLID
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// ========================================
// CONFIGURAÇÃO
// ========================================
const REGION = process.env.REGION || process.env.AWS_REGION;
const USER_POOL_ID = process.env.AUTH_ASAC2F4153AA_USERPOOLID;

// Validação de variáveis de ambiente
if (!REGION || !USER_POOL_ID) {
  console.error("❌ [INIT] Variáveis de ambiente faltando:", {
    REGION,
    USER_POOL_ID,
    ENV: process.env.ENV,
    ALL_ENV: Object.keys(process.env),
  });
}

const cognito = new CognitoIdentityProviderClient({ region: REGION });

// ========================================
// HANDLER PRINCIPAL
// ========================================
/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 *
 * Deleta um usuário do Cognito User Pool
 *
 * @param {Object} event - Evento do AppSync
 * @param {Object} event.arguments - Argumentos da mutation
 * @param {string} event.arguments.username - Email/username do usuário
 * @returns {Promise<boolean>} true se deletado com sucesso
 */
exports.handler = async (event, context) => {
  // Log do contexto para debug
  console.log("🔧 [CONTEXT] Request ID:", context.requestId);
  console.log("🔧 [CONTEXT] Function Name:", context.functionName);

  // Log completo do evento
  console.log("📩 [EVENT] Evento AppSync recebido:");
  console.log(JSON.stringify(event, null, 2));

  // Log das variáveis de ambiente (sem expor dados sensíveis)
  console.log("🔧 [CONFIG] Configuração da Lambda:");
  console.log({
    REGION: REGION,
    USER_POOL_ID: USER_POOL_ID
      ? `${USER_POOL_ID.substring(0, 20)}...`
      : "UNDEFINED",
    ENV: process.env.ENV,
  });

  // ========================================
  // VALIDAÇÃO DE INPUT
  // ========================================
  const { username } = event.arguments || {};

  if (!username) {
    console.error("❌ [VALIDATION] Username não fornecido");
    console.error("📦 [VALIDATION] Arguments recebidos:", event.arguments);
    throw new Error("O parâmetro 'username' (email do usuário) é obrigatório.");
  }

  if (typeof username !== "string" || username.trim() === "") {
    console.error("❌ [VALIDATION] Username inválido:", username);
    throw new Error("O 'username' deve ser uma string não vazia.");
  }

  console.log(`🎯 [VALIDATION] Username validado: ${username}`);

  // ========================================
  // VALIDAÇÃO DE CONFIGURAÇÃO
  // ========================================
  if (!USER_POOL_ID) {
    console.error("❌ [CONFIG] USER_POOL_ID não configurado");
    throw new Error(
      "Configuração incorreta: USER_POOL_ID não está definido nas variáveis de ambiente."
    );
  }

  if (!REGION) {
    console.error("❌ [CONFIG] REGION não configurado");
    throw new Error(
      "Configuração incorreta: REGION não está definido nas variáveis de ambiente."
    );
  }

  // ========================================
  // PREPARAÇÃO DO COMANDO
  // ========================================
  const deleteParams = {
    UserPoolId: USER_POOL_ID,
    Username: username.trim(), // Remove espaços em branco
  };

  console.log("🔥 [COGNITO] Preparando comando AdminDeleteUser");
  console.log(
    "📦 [COGNITO] Parâmetros:",
    JSON.stringify(deleteParams, null, 2)
  );

  // ========================================
  // EXECUÇÃO DA DELEÇÃO
  // ========================================
  try {
    console.log(`⏳ [COGNITO] Enviando comando para deletar: ${username}`);
    console.time("cognito-delete-duration");

    const result = await cognito.send(new AdminDeleteUserCommand(deleteParams));

    console.timeEnd("cognito-delete-duration");
    console.log(`✅ [COGNITO] Usuário ${username} deletado com sucesso!`);
    console.log(
      "📊 [COGNITO] Resposta do Cognito:",
      JSON.stringify(result, null, 2)
    );

    // Retorna true para indicar sucesso
    return true;
  } catch (error) {
    // ========================================
    // TRATAMENTO DE ERROS
    // ========================================
    console.error("❌❌❌ [ERROR] Erro ao deletar usuário do Cognito");
    console.error("🔴 [ERROR] Username tentado:", username);
    console.error("🔴 [ERROR] Nome do erro:", error.name);
    console.error("🔴 [ERROR] Mensagem:", error.message);
    console.error("🔴 [ERROR] Código:", error.$metadata?.httpStatusCode);
    console.error("🔴 [ERROR] Stack completo:", error.stack);

    // Tratamento de erros específicos
    if (error.name === "UserNotFoundException") {
      const errorMsg = `Usuário '${username}' não encontrado no Cognito. Pode já ter sido deletado.`;
      console.error("⚠️ [ERROR]", errorMsg);
      throw new Error(errorMsg);
    }

    if (error.name === "NotAuthorizedException") {
      const errorMsg =
        "Lambda não tem permissão para deletar usuários. Verifique custom-policies.json";
      console.error("🔒 [ERROR]", errorMsg);
      throw new Error(errorMsg);
    }

    if (error.name === "InvalidParameterException") {
      const errorMsg = `Parâmetros inválidos. Verifique se o UserPoolId está correto: ${USER_POOL_ID}`;
      console.error("🔧 [ERROR]", errorMsg);
      throw new Error(errorMsg);
    }

    if (error.name === "TooManyRequestsException") {
      const errorMsg =
        "Muitas requisições ao Cognito. Tente novamente em alguns segundos.";
      console.error("⏱️ [ERROR]", errorMsg);
      throw new Error(errorMsg);
    }

    // Erro genérico
    const errorMsg = `Falha ao deletar usuário do Cognito: ${error.message || "Erro desconhecido"}`;
    console.error("💥 [ERROR]", errorMsg);
    throw new Error(errorMsg);
  }
};
