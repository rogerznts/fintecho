import { assertEquals, assertExists } from "@std/assert";
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";
import { readOfx } from "./src/ofxParser.ts";
import { classifyTransaction } from "./src/classifyTransaction.ts";
import { normalizeText } from "./src/utils.ts";

// Mock do arquivo .env para testes
const mockEnv = {
  SPREADSHEET_ID: "test_spreadsheet_id",
  SHEET_RANGE: "A2:F",
  SHEET_IN: "Entrada",
  SHEET_OUT: "Saída"
};

// Teste de carregamento das variáveis de ambiente
Deno.test("deve carregar variáveis de ambiente corretamente", async () => {
  const env = await load();
  assertExists(env.SPREADSHEET_ID, "SPREADSHEET_ID deve existir");
  assertExists(env.SHEET_RANGE, "SHEET_RANGE deve existir");
});

// Teste de leitura do arquivo OFX
Deno.test("deve ler arquivo OFX corretamente", async () => {
  const transactions = await readOfx("./workdir/20241030_17731cdb.ofx");
  assertEquals(Array.isArray(transactions), true);
  
  if (transactions.length > 0) {
    const firstTransaction = transactions[0];
    assertExists(firstTransaction.type);
    assertExists(firstTransaction.date);
    assertExists(firstTransaction.amount);
    assertExists(firstTransaction.memo);
  }
});

// Teste de classificação de transações
Deno.test("deve classificar transações corretamente", async () => {
  const testCases = [
    {
      memo: "LIGHT SERV ELETRICIDADE",
      expectedCategory: "Energia"
    },
    {
      memo: "Bramil Bra",
      expectedCategory: "Outros"
    },
    {
      memo: "TELECOMUNICACOES LTDA",
      expectedCategory: "Outros"
    },
    {
      memo: "IMOVEIS LTDA",
      expectedCategory: "Outros"
    }
  ];

  for (const testCase of testCases) {
    const category = await classifyTransaction(testCase.memo);
    assertEquals(
      category, 
      testCase.expectedCategory, 
      `Transação "${testCase.memo}" deveria ser classificada como "${testCase.expectedCategory}"`
    );
  }
});

// Teste da função de normalização de texto
Deno.test("deve normalizar texto corretamente", () => {
  const testCases = [
    {
      input: "LIGHT SERV ELETRICIDADE",
      expected: "light serv eletricidade"
    },
    {
      input: "Cereais Bramil Bra",
      expected: "cereais bramil bra"
    },
    {
      input: "TELECOMUNICAÇÕES LTDA",
      expected: "telecomunicacoes ltda"
    }
  ];

  for (const testCase of testCases) {
    const normalized = normalizeText(testCase.input);
    assertEquals(
      normalized, 
      testCase.expected, 
      `Texto "${testCase.input}" deveria ser normalizado para "${testCase.expected}"`
    );
  }
});