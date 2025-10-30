// src/config/amplify-config.ts

// Pega as variáveis de ambiente
const region = process.env.EXPO_PUBLIC_AWS_PROJECT_REGION;
const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID;
const graphqlEndpoint = process.env.EXPO_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT;

// Validação em tempo de execução para garantir que o app não quebre se as variáveis não forem injetadas.
if (!region || !userPoolId || !userPoolClientId || !graphqlEndpoint) {
  // Em modo de desenvolvimento, podemos deixar passar, mas avisamos.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Variáveis de ambiente da AWS não definidas. Isso é esperado no desenvolvimento local, que usará aws-exports.js."
    );
  } else {
    // Em produção (build do EAS), isso é um erro fatal.
    throw new Error(
      "Variáveis de ambiente da AWS não foram encontradas no build. Verifique seus segredos do EAS."
    );
  }
}

// ✅ AQUI ESTÁ A CORREÇÃO PRINCIPAL
// Montamos o objeto de configuração e usamos "as string" para dizer ao TypeScript:
// "Confie em mim, eu já verifiquei. Esses valores são strings."
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: region as string,
      userPoolId: userPoolId as string,
      userPoolClientId: userPoolClientId as string,
    },
  },
  API: {
    GraphQL: {
      endpoint: graphqlEndpoint as string,
      region: region as string,
      defaultAuthMode: "userPool" as const, // "as const" garante que o tipo seja exatamente 'userPool'
    },
  },
};

export default amplifyConfig;
