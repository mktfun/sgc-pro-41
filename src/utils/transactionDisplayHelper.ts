/**
 * Utilitário para exibição inteligente de descrições de transações
 * Implementa fallback quando não há número de apólice disponível
 */

export interface TransactionDisplayData {
  description: string;
  policyNumber?: string | null;
  clientName?: string | null;
  ramoName?: string | null;
  companyName?: string | null;
}

/**
 * Gera o título de exibição inteligente para uma transação
 * Prioridade: Número da Apólice > Cliente + Ramo + Seguradora > Descrição original
 */
export function getTransactionDisplayTitle(data: TransactionDisplayData): string {
  // 1. Se tem número da apólice válido, usar ele
  if (data.policyNumber && data.policyNumber !== 'undefined' && data.policyNumber.trim() !== '') {
    return `Apólice: ${data.policyNumber}`;
  }
  
  // 2. Se não tem apólice mas tem dados complementares, montar fallback
  const parts: string[] = [];
  
  if (data.clientName && data.clientName !== 'Cliente não identificado' && data.clientName.trim() !== '') {
    parts.push(data.clientName);
  }
  
  if (data.ramoName && data.ramoName.trim() !== '') {
    parts.push(data.ramoName);
  }
  
  if (data.companyName && data.companyName.trim() !== '') {
    parts.push(data.companyName);
  }
  
  if (parts.length > 0) {
    return parts.join(' • ');
  }
  
  // 3. Se não tem nada, verificar se a descrição original é genérica
  if (shouldShowFallback(data.description)) {
    return 'Transação Avulsa';
  }
  
  // 4. Fallback final: descrição original
  return data.description;
}

/**
 * Verifica se a descrição original deve ser substituída pelo fallback
 */
export function shouldShowFallback(description: string): boolean {
  const genericPatterns = [
    'undefined',
    'Comissão da apólice undefined',
    'Comissão undefined',
    '---',
    ''
  ];
  
  const lowerDescription = description.toLowerCase().trim();
  
  return genericPatterns.some(pattern => {
    const lowerPattern = pattern.toLowerCase();
    return lowerDescription.includes(lowerPattern) || lowerDescription === lowerPattern;
  });
}

/**
 * Obtém dados de exibição a partir de uma transação e dados associados
 */
export function buildTransactionDisplayData(
  transaction: { description: string; policyId?: string | null; clientId?: string | null },
  policy?: { policyNumber?: string; ramos?: { nome: string } | null; companies?: { name: string } | null } | null,
  client?: { name: string } | null
): TransactionDisplayData {
  return {
    description: transaction.description,
    policyNumber: policy?.policyNumber || null,
    clientName: client?.name || null,
    ramoName: policy?.ramos?.nome || null,
    companyName: policy?.companies?.name || null,
  };
}
