export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompor caracteres com acentos
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .trim();
}
