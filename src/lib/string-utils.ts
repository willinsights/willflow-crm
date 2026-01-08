/**
 * String utility functions
 */

/**
 * Normaliza texto removendo acentos e convertendo para lowercase com hífens
 * Mantém compatibilidade com os status usados nos projetos
 * 
 * Exemplos:
 * - "Em execução" -> "em-execucao"
 * - "A agendar" -> "a-agendar"
 * - "Em edição" -> "em-edicao"
 * 
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado em ASCII lowercase com hífens
 */
export function normalizeToStatusKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (acentos)
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/[^a-z0-9-]/g, ''); // Remover caracteres especiais
}
