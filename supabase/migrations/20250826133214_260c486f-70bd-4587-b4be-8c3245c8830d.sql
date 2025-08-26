
-- Criar tabela para armazenar métricas diárias consolidadas
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  consorcio_value NUMERIC NOT NULL DEFAULT 0,
  saude_value NUMERIC NOT NULL DEFAULT 0,
  auto_value NUMERIC NOT NULL DEFAULT 0,
  residencial_value NUMERIC NOT NULL DEFAULT 0,
  empresarial_value NUMERIC NOT NULL DEFAULT 0,
  outros_value NUMERIC NOT NULL DEFAULT 0,
  apolices_novas INTEGER NOT NULL DEFAULT 0,
  renovacoes INTEGER NOT NULL DEFAULT 0,
  apolices_perdidas INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Criar tabela para logs de sincronização
CREATE TABLE public.sheets_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  sync_date DATE NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS policies para daily_metrics
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily metrics" 
  ON public.daily_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily metrics" 
  ON public.daily_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily metrics" 
  ON public.daily_metrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create daily metrics" 
  ON public.daily_metrics 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update daily metrics" 
  ON public.daily_metrics 
  FOR UPDATE 
  USING (true);

-- Adicionar RLS policies para sheets_sync_logs
ALTER TABLE public.sheets_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs" 
  ON public.sheets_sync_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create sync logs" 
  ON public.sheets_sync_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_daily_metrics()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER handle_updated_at_daily_metrics
    BEFORE UPDATE ON public.daily_metrics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_daily_metrics();

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
