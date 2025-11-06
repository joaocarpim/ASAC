// src/config/amplify-config.ts
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

// ✅ Configuração correta para sua versão do Amplify (compatível com Web + App)
const config = {
  ...awsExports,

  // ✅ Define o Cognito como auth principal
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",

  // ✅ Mantém API Key ativa apenas para leitura pública
  aws_appsync_apiKey: awsExports.aws_appsync_apiKey,
};

// ✅ Aplica configurações
Amplify.configure(config);

console.log("✅ Amplify configurado com Cognito como auth principal + API Key somente para leitura pública.");

export default config;
