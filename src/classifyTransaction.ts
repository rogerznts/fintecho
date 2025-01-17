// classifyTransaction.ts

import { categories } from "./categories.ts";
import { normalizeText } from "./utils.ts";
import ollama, { Message } from "ollama";

export function classifyTransaction(memo: string): string {
  const normalizedMemo = normalizeText(memo);

  // Inicializar variáveis para armazenar a melhor correspondência
  let bestCategory = "Outros";
  let maxMatches = 0;

  for (const category of categories) {
    if (category.name === "Outros") {
      continue; // Ignorar a categoria "Outros" na classificação inicial
    }

    let matches = 0;

    for (const keyword of category.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedMemo.includes(normalizedKeyword)) {
        matches += 1;
      }
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category.name;
    }
  }

  return bestCategory;
}

export async function classifyTransactionLlama(memo: string): Promise<string> {
  const targetModel = "llama3.2";
  const categories = [
    "Mercado",
    "Fastfood",
    "Feira",
    "Moradia",
    "Saúde",
    "Entretenimento",
    "Impostos",
    "Transporte",
    "Parcelas",
    "Presentes",
    "Pets",
    "Viagem",
    "Vestuário",
    "Doação",
    "Comunicação",
    "Assinatura",
    "Educação",
    "Outros",
    "Energia",
    "Serviço",
    "Obra",
    "Cartão",
  ];

  const prompt = `
Classifique a seguinte transação em uma das categorias abaixo. Retorne apenas o nome da categoria exata, sem explicações adicionais.

Categorias:
${categories.map((cat) => `- ${cat}`).join("\n")}

Transação:
"${memo}"

Categoria:
`;

  const message: Message = { role: "user", content: prompt };
  const response = await ollama.chat({
    model: targetModel,
    messages: [message],
    stream: false,
  });

  const output = response.message.content;

  // // Verifique se a saída é uma das categorias esperadas
  if (categories.includes(output)) {
    return classifyTransaction(output);
  } else {
    // Se a saída não for válida, retorne "Outros" ou trate conforme necessário
    return "Outros";
  }
}
