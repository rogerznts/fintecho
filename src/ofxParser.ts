// ofxParser.ts

export interface Transaction {
  type: string;
  date: string;
  amount: string;
  fitId: string;
  memo: string;
  category: string;
}

export async function readOfx(filePath: string): Promise<Transaction[]> {
  let fileContent = await Deno.readTextFile(filePath);

  // Remover cabeçalho SGML (linhas antes da tag <OFX>)
  const startOfx = fileContent.indexOf("<OFX>");
  if (startOfx === -1) throw new Error("Arquivo OFX inválido");
  fileContent = fileContent.slice(startOfx);

  // Extrair transações usando regex
  const transactions: Transaction[] = [];
  const transactionRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
  const typeRegex = /<TRNTYPE>(.*?)<\/TRNTYPE>/;
  const dateRegex = /<DTPOSTED>(.*?)<\/DTPOSTED>/;
  const amountRegex = /<TRNAMT>(.*?)<\/TRNAMT>/;
  const fitIdRegex = /<FITID>(.*?)<\/FITID>/;
  const memoRegex = /<MEMO>(.*?)<\/MEMO>/;

  for (const match of fileContent.matchAll(transactionRegex)) {
    const txnContent = match[1] || "";
    const type = txnContent.match(typeRegex)?.[1] || "";
    const date = txnContent.match(dateRegex)?.[1] || "";
    const amount = txnContent.match(amountRegex)?.[1] || "";
    const fitId = txnContent.match(fitIdRegex)?.[1] || "";
    const memo = txnContent.match(memoRegex)?.[1] || "";
    const category = "";

    transactions.push({ type, date, amount, fitId, memo, category });
  }

  return transactions;
}
