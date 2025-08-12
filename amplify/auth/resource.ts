// amplify/auth/resource.ts

import { defineAuth } from "@aws-amplify/backend";

// Define a configuração de autenticação
export const auth = defineAuth({
  // Define que o login será feito com e-mail e senha
  loginWith: {
    email: true,
  },
  // Já cria um grupo de usuários "Admin", que usaremos para o painel de administrador
  groups: ["Admin"],
});
