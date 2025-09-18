// src/services/adminService.ts
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Chama a API Gateway protegida para registrar um novo assistido.
 * É obrigatório que o usuário logado seja Admin.
 */
export async function callAdminApi(
  name: string,
  email: string,
  password: string
) {
  // Obtém o idToken do usuário atual
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  // Endpoint gerado pelo Amplify (veio do aws-exports.js)
  const endpoint =
    "https://oetq8mqfkg.execute-api.us-east-1.amazonaws.com/dev/AdminRegisterUser";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ⚠️ obrigatório
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro na API Admin: ${res.status} - ${text}`);
  }

  return res.json();
}
