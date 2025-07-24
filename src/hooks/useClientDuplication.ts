
import { useMemo } from 'react';
import { Client } from '@/types';

interface DuplicateAlert {
  count: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

export function useClientDuplication(clients: Client[]) {
  const duplicateAlert = useMemo((): DuplicateAlert => {
    const groups: Array<{ clients: Client[]; confidence: 'high' | 'medium' | 'low' }> = [];
    const processed = new Set<string>();

    // Funções de normalização
    const normalizeName = (name: string): string => {
      return name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizePhone = (phone: string): string => {
      return phone.replace(/\D/g, '');
    };

    const normalizeDocument = (doc: string): string => {
      return doc.replace(/\D/g, '');
    };

    clients.forEach(client => {
      if (processed.has(client.id)) return;

      const duplicates = clients.filter(other => {
        if (other.id === client.id || processed.has(other.id)) return false;

        // Verificar nome similar (normalizado)
        const nameMatch = normalizeName(client.name) === normalizeName(other.name);
        
        // Verificar email exato
        const emailMatch = client.email && other.email && client.email.toLowerCase() === other.email.toLowerCase();
        
        // Verificar telefone (apenas números)
        const phoneMatch = client.phone && other.phone && normalizePhone(client.phone) === normalizePhone(other.phone);
        
        // Verificar CPF/CNPJ
        const docMatch = client.cpfCnpj && other.cpfCnpj && normalizeDocument(client.cpfCnpj) === normalizeDocument(other.cpfCnpj);

        return nameMatch || emailMatch || phoneMatch || docMatch;
      });

      if (duplicates.length > 0) {
        const allClients = [client, ...duplicates];
        allClients.forEach(c => processed.add(c.id));

        // Determinar confiança
        let confidence: 'high' | 'medium' | 'low' = 'low';

        if (allClients.some(c => c.cpfCnpj) && allClients.filter(c => c.cpfCnpj).length > 1) {
          confidence = 'high';
        } else if (allClients.some(c => c.email) && allClients.filter(c => c.email).length > 1) {
          confidence = 'high';
        } else if (allClients.some(c => c.phone) && allClients.filter(c => c.phone).length > 1) {
          confidence = 'medium';
        }

        groups.push({
          clients: allClients,
          confidence
        });
      }
    });

    const totalCount = groups.reduce((sum, group) => sum + group.clients.length, 0);
    const highConfidence = groups.filter(g => g.confidence === 'high').reduce((sum, group) => sum + group.clients.length, 0);
    const mediumConfidence = groups.filter(g => g.confidence === 'medium').reduce((sum, group) => sum + group.clients.length, 0);
    const lowConfidence = groups.filter(g => g.confidence === 'low').reduce((sum, group) => sum + group.clients.length, 0);

    return {
      count: totalCount,
      highConfidence,
      mediumConfidence,
      lowConfidence
    };
  }, [clients]);

  return { duplicateAlert };
}
