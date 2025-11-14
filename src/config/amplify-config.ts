import { Amplify } from "aws-amplify";

// Configurações do Amplify via variáveis de ambiente (EAS Build)
const config = {
  aws_project_region: process.env.EXPO_PUBLIC_AWS_REGION ?? "us-east-1",

  aws_appsync_graphqlEndpoint:
    process.env.EXPO_PUBLIC_APPSYNC_ENDPOINT ??
    "https://izr4ayivprhodgqzf3gm6ijwh4.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: process.env.EXPO_PUBLIC_AWS_REGION ?? "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
  aws_appsync_apiKey: process.env.EXPO_PUBLIC_APPSYNC_APIKEY,

  aws_cognito_identity_pool_id:
    process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL ?? "",
  aws_cognito_region: process.env.EXPO_PUBLIC_AWS_REGION ?? "us-east-1",
  aws_user_pools_id: process.env.EXPO_PUBLIC_USER_POOL_ID ?? "",
  aws_user_pools_web_client_id:
    process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID ?? "",

  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_verification_mechanisms: ["EMAIL"],

  aws_user_files_s3_bucket: process.env.EXPO_PUBLIC_S3_BUCKET ?? "",
  aws_user_files_s3_bucket_region:
    process.env.EXPO_PUBLIC_AWS_REGION ?? "us-east-1",
};

// Inicializa o Amplify
Amplify.configure(config);

export default config;
