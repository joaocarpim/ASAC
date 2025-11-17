// amplify-config.ts
import { Amplify } from "aws-amplify";
import Constants from "expo-constants";

type AwsConfig = {
  aws_project_region: string;
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: string;
  aws_appsync_apiKey?: string;
  aws_cognito_identity_pool_id?: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  aws_user_files_s3_bucket?: string;
  aws_user_files_s3_bucket_region?: string;
};

// Garantia de TypeScript: expoConfig nunca será null no app em execução
const expoConfig = Constants.expoConfig ?? {};
const extra = (expoConfig as any).extra ?? {};
const aws = extra.aws as AwsConfig;

if (!aws) {
  throw new Error("AWS config not found in app.json (extra.aws).");
}

const config = {
  aws_project_region: aws.aws_project_region,
  aws_appsync_graphqlEndpoint: aws.aws_appsync_graphqlEndpoint,
  aws_appsync_region: aws.aws_appsync_region,
  aws_appsync_authenticationType: aws.aws_appsync_authenticationType,
  aws_appsync_apiKey: aws.aws_appsync_apiKey,
  aws_cognito_identity_pool_id: aws.aws_cognito_identity_pool_id,
  aws_cognito_region: aws.aws_cognito_region,
  aws_user_pools_id: aws.aws_user_pools_id,
  aws_user_pools_web_client_id: aws.aws_user_pools_web_client_id,
  aws_user_files_s3_bucket: aws.aws_user_files_s3_bucket,
  aws_user_files_s3_bucket_region: aws.aws_user_files_s3_bucket_region,
};

Amplify.configure(config);

export default config;
