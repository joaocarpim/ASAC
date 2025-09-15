/* Amplify Params - DO NOT EDIT
	API_ASAC_ACHIEVEMENTTABLE_ARN
	API_ASAC_ACHIEVEMENTTABLE_NAME
	API_ASAC_BRAILLESYMBOLTABLE_ARN
	API_ASAC_BRAILLESYMBOLTABLE_NAME
	API_ASAC_GRAPHQLAPIENDPOINTOUTPUT
	API_ASAC_GRAPHQLAPIIDOUTPUT
	API_ASAC_GRAPHQLAPIKEYOUTPUT
	API_ASAC_LESSONTABLE_ARN
	API_ASAC_LESSONTABLE_NAME
	API_ASAC_MODULETABLE_ARN
	API_ASAC_MODULETABLE_NAME
	API_ASAC_PROGRESSTABLE_ARN
	API_ASAC_PROGRESSTABLE_NAME
	API_ASAC_QUESTIONTABLE_ARN
	API_ASAC_QUESTIONTABLE_NAME
	API_ASAC_USERTABLE_ARN
	API_ASAC_USERTABLE_NAME
	AUTH_ASAC2F4153AA_USERPOOLID
	ENV
	REGION
	STORAGE_S3112EAA39_BUCKETNAME
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
  AUTH_ASAC2F4153AA_USERPOOLID
  REGION
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  console.log("📩 Evento recebido:", JSON.stringify(event, null, 2));

  try {
    const { email, name, password } = JSON.parse(event.body);

    if (!email || !name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Campos obrigatórios: email, name, password" }),
      };
    }

    const params = {
      UserPoolId: process.env.AUTH_ASAC2F4153AA_USERPOOLID, // vem do Amplify
      Username: email.toLowerCase(),
      TemporaryPassword: password,
      UserAttributes: [
        { Name: "email", Value: email.toLowerCase() },
        { Name: "name", Value: name },
        { Name: "email_verified", Value: "true" },
      ],
      MessageAction: "SUPPRESS", // não manda email automático
    };

    await cognito.adminCreateUser(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Usuário criado com sucesso!" }),
    };
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
