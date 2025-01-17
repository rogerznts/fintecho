
export interface Category {
  name: string;
  keywords: string[];
}

export const categories: Category[] = [
  { name: "Mercado", keywords: ["supermercado", "mercado", "hipermercado", "mercearia"] },
  { name: "Fastfood", keywords: ["hamburguer", "burger", "pizza", "lanchonete", "fastfood"] },
  { name: "Feira", keywords: ["feira", "hortifruti"] },
  { name: "Moradia", keywords: ["aluguel", "hipoteca", "condominio", "moradia"] },
  { name: "Saúde", keywords: ["farmacia", "hospital", "clínica", "saúde"] },
  { name: "Entretenimento", keywords: ["cinema", "teatro", "show", "streaming", "entretenimento"] },
  { name: "Impostos", keywords: ["imposto", "taxa", "IR", "ISS"] },
  { name: "Transporte", keywords: ["uber", "taxi", "transporte", "combustível", "gasolina", "ônibus", "metrô"] },
  { name: "Parcelas", keywords: ["parcelas", "financiamento", "empréstimo"] },
  { name: "Presentes", keywords: ["presente", "gift", "aniversário", "natal"] },
  { name: "Pets", keywords: ["pet", "cachorro", "gato", "petshop"] },
  { name: "Viagem", keywords: ["viagem", "hotel", "passagem", "aeroporto"] },
  { name: "Vestuário", keywords: ["roupa", "vestuário", "calçados", "moda"] },
  { name: "Doação", keywords: ["doação", "caridade"] },
  { name: "Comunicação", keywords: ["telefone", "internet", "celular", "comunicação"] },
  { name: "Assinatura", keywords: ["assinatura", "subscription", "serviço", "plano"] },
  { name: "Educação", keywords: ["escola", "faculdade", "curso", "educação"] },
  { name: "Energia", keywords: ["energia", "eletricidade", "luz"] },
  { name: "Serviço", keywords: ["serviço", "profissional", "manutenção"] },
  { name: "Obra", keywords: ["obra", "construção", "renovação"] },
  { name: "Cartão", keywords: ["cartão", "credito", "debito"] },
  { name: "Outros", keywords: [] }, // Categoria padrão
];
