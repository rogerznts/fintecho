import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";
import { readOfx, Transaction } from "./src/ofxParser.ts";
import { getAccessToken } from "./src/auth.ts";
import { writeToSheet } from "./src/googleSheets.ts";
import { getAttachments } from "./src/getAttachments.ts";
import { classifyTransaction } from "./src/classifyTransaction.ts";
//import { classifyTransactionLlama } from "./src/classifyTransaction.ts";

// Carregar variáveis de ambiente
const env = await load();

(async () => {
  try {
    const spreadsheetId = env.SPREADSHEET_ID;
    const sheetRange = env.SHEET_RANGE;
    const sheetIn = env.SHEET_IN;
    const sheetOut = env.SHEET_OUT;

    if (!spreadsheetId || !sheetRange) {
      throw new Error("SPREADSHEET_ID ou SHEET_RANGE não configurados no .env");
    }

    const { savedFiles, skippedFiles } = await getAttachments();

    const files: string[] = [...savedFiles, ...skippedFiles];

    let transactions: Transaction[] = [];

    for (const file of files) {
      transactions = transactions.concat(await readOfx(file));
    }

    for (const transaction of transactions) {
      try {
        const category = await classifyTransaction(transaction.memo);
        // transaction.category = category;
        transaction.category = category;
      } catch (error) {
        console.error(`Erro ao classificar a transação "${transaction.memo}":`, error);
        transaction.category = "Outros"; // Tratamento de erro
      }
    }

    //console.log(transactions);

    // Obtém o token de acesso OAuth2
    const accessToken = await getAccessToken();

    //Escreve os dados na planilha do Google Sheets
    if (transactions.length > 0) {
      await writeToSheet(spreadsheetId, sheetRange, sheetIn, sheetOut, transactions, accessToken);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro:", error.message);
    } else {
      console.error("Erro desconhecido:", error);
    }
  }
})();
