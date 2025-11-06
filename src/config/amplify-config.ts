
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

const config = {
    ...awsExports,
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
    aws_appsync_apiKey: awsExports.aws_appsync_apiKey,
};

Amplify.configure(config);

console.log("Amplify configurado com Cognito como auth principal + API Key somente para leitura");
export default config;