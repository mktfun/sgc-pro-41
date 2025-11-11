import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { subDays } from 'date-fns';

export interface ClientFilters {
  searchTerm?: string;
  seguradoraId?: string | null;
  ramo?: string | null;
  status?: string;
}

export interface ClientKPIs {
  totalActive: number;           // Clientes com status "Ativo"
  newClientsLast30d: number;     // Clientes criados nos últimos 30 dias
  clientsWithPolicies: number;   // Clientes que têm >= 1 apólice ativa
  totalPoliciesValue: number;    // Soma do prêmio de apólices ativas
}

export function useClientKPIs(filters: ClientFilters) {
  const { user } = useAuth();

  const { data: kpis, isLoading, error } = useQuery({
    queryKey: ['client-kpis', filters, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('📊 Calculating Client KPIs with filters:', filters);

      // ETAPA 1: Buscar IDs de clientes filtrados
      let clientIds: string[] = [];

      // Se tem filtros de seguradora ou ramo, buscar via apólices
      if ((filters.seguradoraId && filters.seguradoraId !== 'all') || 
          (filters.ramo && filters.ramo !== 'all')) {
        let policiesQuery = supabase
          .from('apolices')
          .select('client_id')
          .eq('user_id', user.id);

        if (filters.seguradoraId && filters.seguradoraId !== 'all') {
          policiesQuery = policiesQuery.eq('insurance_company', filters.seguradoraId);
        }
        if (filters.ramo && filters.ramo !== 'all') {
          policiesQuery = policiesQuery.eq('type', filters.ramo);
        }

        const { data: policiesData, error: policiesError } = await policiesQuery;
        if (policiesError) throw policiesError;

        clientIds = Array.from(new Set((policiesData || []).map(p => p.client_id).filter(Boolean))) as string[];
        
        if (clientIds.length === 0) {
          return {
            totalActive: 0,
            newClientsLast30d: 0,
            clientsWithPolicies: 0,
            totalPoliciesValue: 0,
          };
        }
      }

      // ETAPA 2: Construir query de clientes com filtros
      let query = supabase
        .from('clientes')
        .select('id, status, created_at')
        .eq('user_id', user.id);

      // Aplicar filtro de IDs (se foi filtrado por seguradora/ramo)
      if (clientIds.length > 0) {
        query = query.in('id', clientIds);
      }

      // Aplicar busca se configurada
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.trim();
        query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,cpf_cnpj.ilike.%${term}%`);
      }

      // Aplicar filtro de status
      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      // Executar query (SEM PAGINAÇÃO!)
      const { data: clientsData, error: clientsError } = await query;
      if (clientsError) throw clientsError;

      // ETAPA 3: Calcular KPIs básicos dos clientes
      const thirtyDaysAgo = subDays(new Date(), 30);
      const filteredClientIds = (clientsData || []).map(c => c.id);

      const totalActive = (clientsData || []).filter(c => c.status === 'Ativo').length;
      const newClientsLast30d = (clientsData || []).filter(c => 
        new Date(c.created_at) >= thirtyDaysAgo
      ).length;

      // ETAPA 4: Buscar apólices ativas desses clientes para calcular KPIs relacionados
      let policiesQuery = supabase
        .from('apolices')
        .select('client_id, premium_value')
        .eq('user_id', user.id)
        .eq('status', 'Ativa');

      if (filteredClientIds.length > 0) {
        policiesQuery = policiesQuery.in('client_id', filteredClientIds);
      }

      const { data: activePoliciesData, error: policiesError } = await policiesQuery;
      if (policiesError) throw policiesError;

      // Calcular KPIs relacionados a apólices
      const clientsWithActivePolicies = new Set((activePoliciesData || []).map(p => p.client_id));
      const clientsWithPolicies = clientsWithActivePolicies.size;

      const totalPoliciesValue = (activePoliciesData || []).reduce(
        (sum, policy) => sum + (Number(policy.premium_value) || 0),
        0
      );

      const calculatedKPIs = {
        totalActive,
        newClientsLast30d,
        clientsWithPolicies,
        totalPoliciesValue,
      };

      console.log('✅ Client KPIs calculated:', calculatedKPIs);
      return calculatedKPIs;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    kpis: kpis || {
      totalActive: 0,
      newClientsLast30d: 0,
      clientsWithPolicies: 0,
      totalPoliciesValue: 0,
    },
    isLoading,
    error,
  };
}
