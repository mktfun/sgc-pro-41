
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, RefreshCw, Database, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useDailyMetrics, useSyncLogs, useManualSync, useConsolidateMetrics } from '@/hooks/useSheetsSync';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SheetsSyncDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const { data: metrics = [], isLoading: metricsLoading } = useDailyMetrics();
  const { data: logs = [], isLoading: logsLoading } = useSyncLogs();
  const manualSync = useManualSync();
  const consolidateMetrics = useConsolidateMetrics();

  const handleManualSync = () => {
    manualSync.mutate(selectedDate || undefined);
  };

  const handleConsolidate = () => {
    consolidateMetrics.mutate(selectedDate || undefined);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Sincronizado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const recentMetrics = metrics.slice(0, 10);
  const recentLogs = logs.slice(0, 10);

  const syncedCount = metrics.filter(m => m.sync_status === 'synced').length;
  const pendingCount = metrics.filter(m => m.sync_status === 'pending').length;
  const errorCount = metrics.filter(m => m.sync_status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sincronização Google Sheets</h2>
          <p className="text-muted-foreground">
            Gerencie a sincronização automática de métricas diárias com sua planilha
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConsolidate}
            disabled={consolidateMetrics.isPending}
            variant="outline"
          >
            <Database className="w-4 h-4 mr-2" />
            {consolidateMetrics.isPending ? 'Consolidando...' : 'Consolidar Dados'}
          </Button>
          <Button
            onClick={handleManualSync}
            disabled={manualSync.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {manualSync.isPending ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
                <p className="text-sm text-muted-foreground">Sincronizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{metrics.length}</p>
                <p className="text-sm text-muted-foreground">Total de Dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Métricas Diárias Recentes
            </CardTitle>
            <CardDescription>
              Últimas 10 métricas consolidadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : recentMetrics.length > 0 ? (
              <div className="space-y-3">
                {recentMetrics.map((metric) => {
                  const totalValue = 
                    metric.consorcio_value + 
                    metric.saude_value + 
                    metric.auto_value + 
                    metric.residencial_value + 
                    metric.empresarial_value + 
                    metric.outros_value;

                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(metric.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          {getStatusBadge(metric.sync_status)}
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                          <span>Total: {formatCurrency(totalValue)}</span>
                          <span>Apólices: {metric.apolices_novas} novas, {metric.renovacoes} renov.</span>
                        </div>
                        {metric.error_message && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {metric.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma métrica encontrada</p>
                <p className="text-sm">Execute a consolidação para gerar dados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs de Sincronização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Logs de Sincronização
            </CardTitle>
            <CardDescription>
              Histórico das sincronizações com Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(log.sync_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.message}
                        {log.execution_time_ms && (
                          <span className="ml-2">({log.execution_time_ms}ms)</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log encontrado</p>
                <p className="text-sm">Os logs aparecerão após as sincronizações</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações da Planilha */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Planilha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">ID da Planilha</h4>
                <code className="text-sm bg-muted p-2 rounded block">
                  1o_WtKQe8huRjXnGauf5DfQLqUOTsfKuXRtDLgaYC0AM
                </code>
              </div>
              <div>
                <h4 className="font-medium mb-2">Email do Robô</h4>
                <code className="text-sm bg-muted p-2 rounded block break-all">
                  dash-jj@cranial-dc3ef.iam.gserviceaccount.com
                </code>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Estrutura dos Dados</h4>
              <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
                <span>• Data</span>
                <span>• Corretor</span>
                <span>• Consórcio (R$)</span>
                <span>• Saúde (R$)</span>
                <span>• Auto (R$)</span>
                <span>• Residencial (R$)</span>
                <span>• Empresarial (R$)</span>
                <span>• Outros (R$)</span>
                <span>• Produção Total</span>
                <span>• Apólices Novas</span>
                <span>• Renovações</span>
                <span>• Apólices Perdidas</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sincronização Automática</h4>
              <p className="text-sm text-blue-700">
                O sistema executa automaticamente todos os dias às 01:00 da manhã:
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>1. Consolida os dados do dia anterior</li>
                <li>2. Envia as métricas para o Google Sheets</li>
                <li>3. Registra logs de execução</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
