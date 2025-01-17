// googleSheets.ts

import { Transaction } from "./ofxParser.ts";

export async function writeToSheet(spreadsheetId: string, sheetRange: string,  sheetIn: string, sheetOut: string, transactions: Transaction[], accessToken: string) {
  const values = [["Tipo", "Data", "Valor", "FITID", "Descrição", "Categoria"]];

  transactions.forEach((txn) => {
    values.push([txn.type, txn.date, txn.amount, txn.fitId, txn.memo, txn.category]);
  });

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetIn}${sheetRange}:append?valueInputOption=RAW`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (response.ok) {
    console.log("Dados escritos com sucesso!");
  } else {
    const errorData = await response.json();
    throw new Error(`Erro ao escrever na planilha: ${errorData.error.message}`);
  }
}
