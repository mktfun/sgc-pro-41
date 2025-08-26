
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DailyMetric {
  id: string;
  user_id: string;
  date: string;
  consorcio_value: number;
  saude_value: number;
  auto_value: number;
  residencial_value: number;
  empresarial_value: number;
  outros_value: number;
  apolices_novas: number;
  renovacoes: number;
  apolices_perdidas: number;
  sync_status: 'pending' | 'synced' | 'error';
  synced_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  sync_date: string;
  status: string;
  message?: string;
  execution_time_ms?: number;
  created_at: string;
}

export function useDailyMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily-metrics', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as DailyMetric[];
    },
    enabled: !!user
  });
}

export function useSyncLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sync-logs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('sheets_sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SyncLog[];
    },
    enabled: !!user
  });
}

export function useManualSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date?: string) => {
      // Primeiro consolidar dados
      const consolidateResponse = await supabase.functions.invoke('consolidate-daily-metrics', {
        body: { date }
      });

      if (consolidateResponse.error) {
        throw new Error(consolidateResponse.error.message);
      }

      // Depois sincronizar com Sheets
      const syncResponse = await supabase.functions.invoke('sync-to-sheets', {
        body: { date }
      });

      if (syncResponse.error) {
        throw new Error(syncResponse.error.message);
      }

      return syncResponse.data;
    },
    onSuccess: (data) => {
      toast.success(`Sincronização concluída! ${data.synced} métricas enviadas.`);
      queryClient.invalidateQueries({ queryKey: ['daily-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
    },
    onError: (error) => {
      toast.error(`Erro na sincronização: ${error.message}`);
    }
  });
}

export function useConsolidateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date?: string) => {
      const response = await supabase.functions.invoke('consolidate-daily-metrics', {
        body: { date }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.consolidated} métricas consolidadas para ${data.date}`);
      queryClient.invalidateQueries({ queryKey: ['daily-metrics'] });
    },
    onError: (error) => {
      toast.error(`Erro na consolidação: ${error.message}`);
    }
  });
}
