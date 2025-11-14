const fs = require("fs");
const path = require("path");

// Pega as variáveis de ambiente ou usa valores do app.json como fallback
const getEnvVar = (key, fallback) => {
  return process.env[key] || fallback || "";
};

// Valores padrão do app.json
const defaults = {
  AWS_PROJECT_REGION: "us-east-1",
  AWS_APPSYNC_GRAPHQL_ENDPOINT:
    "https://izr4ayivprhodgqzf3gm6ijwh4.appsync-api.us-east-1.amazonaws.com/graphql",
  AWS_APPSYNC_AUTH_TYPE: "AMAZON_COGNITO_USER_POOLS",
  AWS_APPSYNC_API_KEY: "da2-bd27jwfofvf5ldshzssk7wufsm",
  AWS_USER_POOLS_ID: "us-east-1_00uu9Yg4p",
  AWS_USER_POOLS_WEB_CLIENT_ID: "3imrsqbj2nral6o47uerq3u5qp",
  AWS_USER_FILES_S3_BUCKET: "asacf2d64dd682824f0a9d23969cf8cd6bf211020-dev",
  AWS_USER_FILES_S3_BUCKET_REGION: "us-east-1",
};

const content = `/* eslint-disable */
// Este arquivo é gerado automaticamente pelo script antes da build.

const awsmobile = {
  aws_project_region: "${getEnvVar(
    "AWS_PROJECT_REGION",
    defaults.AWS_PROJECT_REGION
  )}",
  aws_appsync_graphqlEndpoint: "${getEnvVar(
    "AWS_APPSYNC_GRAPHQL_ENDPOINT",
    defaults.AWS_APPSYNC_GRAPHQL_ENDPOINT
  )}",
  aws_appsync_region: "${getEnvVar(
    "AWS_PROJECT_REGION",
    defaults.AWS_PROJECT_REGION
  )}",
  aws_appsync_authenticationType: "${getEnvVar(
    "AWS_APPSYNC_AUTH_TYPE",
    defaults.AWS_APPSYNC_AUTH_TYPE
  )}",
  aws_appsync_apiKey: "${getEnvVar(
    "AWS_APPSYNC_API_KEY",
    defaults.AWS_APPSYNC_API_KEY
  )}",
  aws_user_pools_id: "${getEnvVar(
    "AWS_USER_POOLS_ID",
    defaults.AWS_USER_POOLS_ID
  )}",
  aws_user_pools_web_client_id: "${getEnvVar(
    "AWS_USER_POOLS_WEB_CLIENT_ID",
    defaults.AWS_USER_POOLS_WEB_CLIENT_ID
  )}",
  aws_user_files_s3_bucket: "${getEnvVar(
    "AWS_USER_FILES_S3_BUCKET",
    defaults.AWS_USER_FILES_S3_BUCKET
  )}",
  aws_user_files_s3_bucket_region: "${getEnvVar(
    "AWS_USER_FILES_S3_BUCKET_REGION",
    defaults.AWS_USER_FILES_S3_BUCKET_REGION
  )}"
};

export default awsmobile;
`;

// Garante que o diretório src existe
const srcDir = path.resolve(__dirname, "../src");
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

const filePath = path.resolve(srcDir, "aws-exports.js");
fs.writeFileSync(filePath, content.trim());
console.log("✅ aws-exports.js gerado com sucesso!");
console.log(`📍 Localização: ${filePath}`);
