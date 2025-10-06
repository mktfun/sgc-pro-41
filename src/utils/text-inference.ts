/**
 * Utilitário para inferir o ramo de seguro baseado na descrição da transação
 * Usa palavras-chave para sugerir automaticamente o tipo de seguro
 */

export function inferRamoFromDescription(description: string, ramosDisponiveis: string[]): string | null {
  if (!description) return null;
  
  const desc = description.toLowerCase().trim();
  
  // Mapeamento de palavras-chave -> ramo
  const keywords: Record<string, string[]> = {
    'Auto': ['auto', 'carro', 'veículo', 'veiculo', 'automóvel', 'automovel', 'frota', 'caminhão', 'moto', 'motocicleta'],
    'Residencial': ['residencial', 'casa', 'imóvel', 'imovel', 'apartamento', 'residência', 'residencia', 'moradia', 'lar'],
    'Empresarial': ['empresarial', 'empresa', 'comercial', 'negócio', 'negocio', 'estabelecimento', 'loja'],
    'Vida': ['vida', 'morte', 'invalidez', 'funeral', 'seguro de vida'],
    'Saúde': ['saúde', 'saude', 'plano', 'médico', 'medico', 'hospitalar', 'clínica', 'clinica', 'consulta'],
    'Consórcio': ['consórcio', 'consorcio', 'contemplação', 'contemplacao', 'lance'],
    'Outros': ['outro', 'diversos', 'geral']
  };
  
  // Tentar encontrar correspondência direta com os ramos disponíveis
  for (const [ramo, palavrasChave] of Object.entries(keywords)) {
    if (ramosDisponiveis.includes(ramo)) {
      for (const palavra of palavrasChave) {
        if (desc.includes(palavra)) {
          return ramo;
        }
      }
    }
  }
  
  return null;
}

/**
 * Verifica se há uma similaridade forte entre a descrição e um ramo específico
 * Útil para validação e feedback ao usuário
 */
export function getSimilarityScore(description: string, ramo: string): number {
  const desc = description.toLowerCase();
  const ramoLower = ramo.toLowerCase();
  
  if (desc.includes(ramoLower)) return 1.0; // Match exato
  
  // Palavras relacionadas ao ramo
  const relatedWords: Record<string, string[]> = {
    'auto': ['carro', 'veículo', 'automóvel'],
    'residencial': ['casa', 'imóvel', 'moradia'],
    'vida': ['morte', 'funeral'],
    'saúde': ['médico', 'plano', 'hospitalar']
  };
  
  const related = relatedWords[ramoLower] || [];
  const matches = related.filter(word => desc.includes(word)).length;
  
  return matches > 0 ? 0.7 : 0;
}
