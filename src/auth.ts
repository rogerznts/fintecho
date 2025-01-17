import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Remove os cabeçalhos e rodapés do PEM e converte para um ArrayBuffer
  const pemContents = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0)).buffer;

  // Importa a chave como CryptoKey
  return await crypto.subtle.importKey("pkcs8", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["sign"]);
}

export async function getAccessToken(): Promise<string> {
  const authFile = JSON.parse(await Deno.readTextFile("./config/auth.json"));

  const jwtPayload = {
    iss: authFile.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: getNumericDate(60 * 60),
    iat: getNumericDate(0),
  };

  // Converte a chave privada para `CryptoKey`
  const privateKey = await importPrivateKey(authFile.private_key);

  // Gera o JWT usando a chave privada convertida
  const jwt = await create({ alg: "RS256" }, jwtPayload, privateKey);

  // Troca o JWT pelo token de acesso
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Erro na autenticação: ${data.error}`);
  return data.access_token;
}
