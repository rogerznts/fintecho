// Importa os módulos necessários
import { ensureDir, exists } from "https://deno.land/std@0.203.0/fs/mod.ts";
import { OAuth2Client } from "npm:google-auth-library";
import { google } from "npm:googleapis";

// Define o diretório para salvar os anexos
const downloadDirectory = "./workdir/";

// Garante que o diretório existe
await ensureDir(downloadDirectory);

// Caminhos para os arquivos de credenciais e token
const CREDENTIALS_PATH = "./config/mail.json";
const TOKEN_PATH = "./config/token.json";

// Define o tipo do token
interface OAuth2Token {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// Carrega as credenciais do cliente a partir do arquivo local
async function loadCredentials() {
  const content = await Deno.readTextFile(CREDENTIALS_PATH);
  return JSON.parse(content);
}

// Salva o token em disco para uso posterior
async function saveToken(token: OAuth2Token) {
  await Deno.writeTextFile(TOKEN_PATH, JSON.stringify(token));
  console.log("Token armazenado em", TOKEN_PATH);
}

// Solicita um novo token após pedir autorização ao usuário
async function getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    prompt: "consent",
  });
  console.log("Autorize este aplicativo visitando esta URL:\n", authUrl);

  // Abre a URL no navegador padrão
  let commandName = "";
  let args: string[] = [];

  if (Deno.build.os === "windows") {
    commandName = "cmd";
    args = ["/c", "start", "", authUrl];
  } else if (Deno.build.os === "darwin") {
    commandName = "open";
    args = [authUrl];
  } else if (Deno.build.os === "linux") {
    commandName = "xdg-open";
    args = [authUrl];
  } else {
    console.error("Sistema operacional não suportado para abertura automática do navegador.");
    console.log("Por favor, abra a seguinte URL no seu navegador:\n", authUrl);
  }

  if (commandName) {
    const command = new Deno.Command(commandName, { args });
    const process = command.spawn();
    await process.status;
  }

  // Instruções ao usuário
  console.log("\nApós autorizar o aplicativo, você será redirecionado para uma URL.");
  console.log("Por favor, copie e cole essa URL inteira aqui.");

  // Solicita a entrada do usuário
  const input = await promptUser("Cole a URL aqui: ");

  // Extrai o código da entrada
  let code = input.trim();

  // Se a entrada parecer uma URL, extrai o parâmetro 'code'
  if (code.startsWith("http")) {
    try {
      const url = new URL(code);
      code = url.searchParams.get("code") || "";
      if (!code) {
        console.error("Parâmetro 'code' não encontrado na URL. Certifique-se de colar a URL correta.");
        throw new Error("Código de autorização não encontrado.");
      }
    } catch (e) {
      console.error("URL inválida. Certifique-se de colar a URL correta.");
      throw e;
    }
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await saveToken(tokens);
    console.log("Token de acesso obtido e salvo com sucesso.");
    return oAuth2Client;
  } catch (error) {
    console.error("Erro ao obter o token de acesso:", error);
    throw error;
  }
}

// Função simples para solicitar entrada do usuário
function promptUser(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    Deno.stdout.write(new TextEncoder().encode(prompt));
    const buf = new Uint8Array(1024);
    Deno.stdin.read(buf).then((n) => {
      const input = new TextDecoder().decode(buf.subarray(0, n!)).trim();
      resolve(input.replace(/\r?\n|\r/g, ""));
    });
  });
}

// Autoriza um cliente com as credenciais
async function authorize(): Promise<OAuth2Client> {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Verifica se já temos um token armazenado
  try {
    const tokenContent = await Deno.readTextFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(tokenContent));
    // Testa se o token é válido fazendo uma solicitação simples
    await oAuth2Client.getAccessToken();
    return oAuth2Client;
  } catch (error) {
    // Se o token for inválido ou expirado, inicia o fluxo de autorização novamente
    console.log("Token inválido ou expirado. Solicitando um novo token... ", error);
    // Remove o token inválido, se existir
    try {
      await Deno.remove(TOKEN_PATH);
    } catch (e) {
      // Ignora erros ao remover o arquivo
      console.log(e);
    }
    return await getNewToken(oAuth2Client);
  }
}

// Função para gerar o nome do arquivo no formato desejado
async function generateFilename(originalFilename: string): Promise<string> {
  const now = new Date();
  const YYYY = now.getFullYear().toString();
  const MM = (now.getMonth() + 1).toString().padStart(2, '0');
  const DD = now.getDate().toString().padStart(2, '0');

  // Gerar hash a partir do nome original do arquivo
  const encoder = new TextEncoder();
  const data = encoder.encode(originalFilename);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Converter o hash para uma string hexadecimal
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Opcionalmente, usar apenas os primeiros caracteres para encurtar o nome do arquivo
  const hashShort = hashHex.substring(0, 8); // Primeiros 8 caracteres

  return `${YYYY}${MM}${DD}_${hashShort}.ofx`;
}

// Função principal para obter os anexos
export async function getAttachments(): Promise<{ savedFiles: string[], skippedFiles: string[] }> {
  const savedFiles: string[] = [];
  const skippedFiles: string[] = [];

  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    //const today = new Date();
    //const year = today.getFullYear();
    //const month = String(today.getMonth() + 1).padStart(2, '0');
    //const day = String(today.getDate()).padStart(2, '0');
    //const todayDate = `${year}/${month}/${day}`;

    // Busca e-mails com "extrato" no assunto
    const res = await gmail.users.messages.list({
      userId: "me",
      // q: `subject:extrato is:unread after:${todayDate}`,
      q: `subject:extrato`,
    });

    if (!res.data.messages || res.data.messages.length === 0) {
      console.log("Nenhuma mensagem encontrada.");
      return { savedFiles, skippedFiles };
    }

    for (const message of res.data.messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
        format: "full",
      });

      const parts = msg.data.payload?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.filename && part.filename.toLowerCase().endsWith(".ofx")) {
          const newFilename = await generateFilename(part.filename);
          const filePath = `${downloadDirectory}${newFilename}`;

          // Verifica se o arquivo já existe
          if (await exists(filePath)) {
            console.log(`Arquivo já existe e será ignorado: ${filePath}`);
            skippedFiles.push(filePath);
            continue;
          }

          const attachId = part.body?.attachmentId;
          if (attachId) {
            const attach = await gmail.users.messages.attachments.get({
              userId: "me",
              messageId: message.id!,
              id: attachId,
            });

            const data = attach.data.data;
            if (data) {
              const fileData = Uint8Array.from(
                atob(data.replace(/-/g, '+').replace(/_/g, '/')),
                c => c.charCodeAt(0)
              );

              await Deno.writeFile(filePath, fileData);
              console.log(`Anexo .ofx salvo em ${filePath}`);

              savedFiles.push(filePath);
            }
          }
        } else if (part.parts) {
          // Trata mensagens multipartes
          for (const subPart of part.parts) {
            if (subPart.filename && subPart.filename.toLowerCase().endsWith(".ofx")) {
              const newFilename = await generateFilename(subPart.filename);
              const filePath = `${downloadDirectory}${newFilename}`;

              // Verifica se o arquivo já existe
              if (await exists(filePath)) {
                console.log(`Arquivo já existe e será ignorado: ${filePath}`);
                skippedFiles.push(filePath);
                continue;
              }

              const attachId = subPart.body?.attachmentId;
              if (attachId) {
                const attach = await gmail.users.messages.attachments.get({
                  userId: "me",
                  messageId: message.id!,
                  id: attachId,
                });

                const data = attach.data.data;
                if (data) {
                  const fileData = Uint8Array.from(
                    atob(data.replace(/-/g, '+').replace(/_/g, '/')),
                    c => c.charCodeAt(0)
                  );

                  await Deno.writeFile(filePath, fileData);
                  console.log(`Anexo .ofx salvo em ${filePath}`);

                  savedFiles.push(filePath);
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Erro ao baixar anexos:", error);
  }

  return { savedFiles, skippedFiles };
}
