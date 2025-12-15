import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';
import { PolicyFilters } from '@/hooks/useFilteredPolicies';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseCompanies } from '@/hooks/useSupabaseCompanies';
import { useSupabaseProducers } from '@/hooks/useSupabaseProducers';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, addDays, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import { generatePoliciesReport, PolicyReportData, PolicyReportOptions } from '@/utils/pdf/generatePoliciesReport';

interface ExportPoliciesModalProps {
  filters: PolicyFilters;
  disabled?: boolean;
}

export function ExportPoliciesModal({ filters, disabled }: ExportPoliciesModalProps) {
  const { user } = useAuth();
  const { companies } = useSupabaseCompanies();
  const { producers } = useSupabaseProducers();
  
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Configurações do relatório
  const [title, setTitle] = useState('Relatório de Apólices');
  const [sortBy, setSortBy] = useState<'vencimento' | 'cliente' | 'seguradora' | 'premio'>('vencimento');
  const [columns, setColumns] = useState({
    clienteContato: true,
    apoliceSeguradora: true,
    vigencia: true,
    ramo: true,
    premio: true,
    comissao: false, // OFF por padrão
  });

  // ========================================
  // HELPERS PARA EXIBIR FILTROS ATIVOS
  // ========================================
  const getActiveFiltersDisplay = () => {
    const activeFilters: { label: string; value: string }[] = [];

    if (filters.status && filters.status !== 'todos') {
      activeFilters.push({ label: 'Status', value: filters.status });
    }
    if (filters.insuranceCompany && filters.insuranceCompany !== 'todas') {
      const company = companies.find(c => c.id === filters.insuranceCompany);
      activeFilters.push({ label: 'Seguradora', value: company?.name || filters.insuranceCompany });
    }
    if (filters.producerId && filters.producerId !== 'todos') {
      const producer = producers.find(p => p.id === filters.producerId);
      activeFilters.push({ label: 'Produtor', value: producer?.name || filters.producerId });
    }
    if (filters.period && filters.period !== 'todos') {
      const periodLabels: Record<string, string> = {
        'current-month': 'Mês Corrente',
        'next-30-days': 'Próximos 30 dias',
        'next-90-days': 'Próximos 90 dias',
        'expired': 'Expiradas',
        'custom': 'Personalizado'
      };
      activeFilters.push({ label: 'Período', value: periodLabels[filters.period] || filters.period });
    }
    if (filters.searchTerm) {
      activeFilters.push({ label: 'Busca', value: filters.searchTerm });
    }

    return activeFilters;
  };

  // ========================================
  // FETCH COMPLETO (SEM PAGINAÇÃO)
  // ========================================
  const fetchAllPolicies = async (): Promise<PolicyReportData[]> => {
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from('apolices')
      .select(`
        id,
        policy_number,
        status,
        premium_value,
        commission_rate,
        expiration_date,
        start_date,
        type,
        companies:insurance_company (name),
        ramos:ramo_id (nome),
        clientes:client_id (name, phone, email)
      `)
      .eq('user_id', user.id);

    // Aplicar filtros (mesma lógica do CSV export)
    if (filters.status && filters.status !== 'todos') {
      query = query.eq('status', filters.status);
    }
    if (filters.insuranceCompany && filters.insuranceCompany !== 'todas') {
      query = query.eq('insurance_company', filters.insuranceCompany);
    }
    if (filters.ramo && filters.ramo !== 'todos') {
      query = query.eq('ramo_id', filters.ramo);
    }
    if (filters.producerId && filters.producerId !== 'todos') {
      query = query.eq('producer_id', filters.producerId);
    }
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(`policy_number.ilike.%${searchTerm}%,insured_asset.ilike.%${searchTerm}%`);
    }

    // Filtro por período
    if (filters.period && filters.period !== 'todos') {
      const hoje = startOfToday();
      if (filters.period === 'custom' && filters.customStart && filters.customEnd) {
        query = query
          .gte('expiration_date', filters.customStart)
          .lte('expiration_date', filters.customEnd);
      } else {
        switch (filters.period) {
          case 'current-month':
            query = query
              .gte('expiration_date', startOfMonth(hoje).toISOString())
              .lte('expiration_date', endOfMonth(hoje).toISOString());
            break;
          case 'next-30-days':
            query = query
              .gte('expiration_date', hoje.toISOString())
              .lte('expiration_date', addDays(hoje, 30).toISOString());
            break;
          case 'next-90-days':
            query = query
              .gte('expiration_date', hoje.toISOString())
              .lte('expiration_date', addDays(hoje, 90).toISOString());
            break;
          case 'expired':
            query = query.lt('expiration_date', hoje.toISOString());
            break;
        }
      }
    }

    // SEM PAGINAÇÃO - buscar tudo
    const { data, error } = await query.order('expiration_date', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nenhuma apólice encontrada com os filtros aplicados.');
    }

    // Mapear para o formato do relatório
    return data.map(policy => ({
      numero: policy.policy_number,
      cliente: {
        nome: policy.clientes?.name || 'Cliente não encontrado',
        telefone: policy.clientes?.phone || null,
        email: policy.clientes?.email || null,
      },
      seguradora: policy.companies?.name || null,
      ramo: policy.ramos?.nome || policy.type || null,
      vigencia: {
        inicio: policy.start_date,
        fim: policy.expiration_date,
      },
      premio: Number(policy.premium_value) || 0,
      comissao: (Number(policy.premium_value) || 0) * (Number(policy.commission_rate) || 0) / 100,
      comissaoPercentual: Number(policy.commission_rate) || 0,
      status: policy.status,
    }));
  };

  // ========================================
  // GERAR RELATÓRIO
  // ========================================
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const policies = await fetchAllPolicies();
      
      const activeFiltersDisplay = getActiveFiltersDisplay();
      const seguradoraFilter = activeFiltersDisplay.find(f => f.label === 'Seguradora')?.value;
      const produtorFilter = activeFiltersDisplay.find(f => f.label === 'Produtor')?.value;
      const periodoFilter = activeFiltersDisplay.find(f => f.label === 'Período')?.value;

      const reportOptions: PolicyReportOptions = {
        title,
        filters: {
          status: filters.status !== 'todos' ? filters.status : undefined,
          seguradora: seguradoraFilter,
          produtor: produtorFilter,
          periodo: periodoFilter,
        },
        columns,
        sortBy,
      };

      await generatePoliciesReport(policies, reportOptions);
      
      toast.success(`Relatório gerado com ${policies.length} apólices!`);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
    } finally {
      setIsExporting(false);
    }
  };

  const activeFilters = getActiveFiltersDisplay();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="bg-blue-700 hover:bg-blue-600 text-white border-blue-600"
        >
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Exportar Relatório de Apólices</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filtros Ativos */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Filtros ativos da tela:</Label>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-slate-700 text-slate-200">
                    {filter.label}: {filter.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Título do Relatório</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Colunas */}
          <div className="space-y-3">
            <Label className="text-slate-300">Colunas a incluir:</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-cliente"
                  checked={columns.clienteContato}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, clienteContato: !!checked }))
                  }
                />
                <label htmlFor="col-cliente" className="text-sm text-slate-300 cursor-pointer">
                  Cliente & Contato
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-apolice"
                  checked={columns.apoliceSeguradora}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, apoliceSeguradora: !!checked }))
                  }
                />
                <label htmlFor="col-apolice" className="text-sm text-slate-300 cursor-pointer">
                  Apólice & Seguradora
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-vigencia"
                  checked={columns.vigencia}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, vigencia: !!checked }))
                  }
                />
                <label htmlFor="col-vigencia" className="text-sm text-slate-300 cursor-pointer">
                  Vigência
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-ramo"
                  checked={columns.ramo}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, ramo: !!checked }))
                  }
                />
                <label htmlFor="col-ramo" className="text-sm text-slate-300 cursor-pointer">
                  Ramo
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-premio"
                  checked={columns.premio}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, premio: !!checked }))
                  }
                />
                <label htmlFor="col-premio" className="text-sm text-slate-300 cursor-pointer">
                  Prêmio
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="col-comissao"
                  checked={columns.comissao}
                  onCheckedChange={(checked) =>
                    setColumns(prev => ({ ...prev, comissao: !!checked }))
                  }
                />
                <label htmlFor="col-comissao" className="text-sm text-slate-300 cursor-pointer">
                  Comissão (opcional)
                </label>
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div className="space-y-2">
            <Label className="text-slate-300">Ordenar por:</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vencimento">Data de Vencimento</SelectItem>
                <SelectItem value="cliente">Nome do Cliente (A-Z)</SelectItem>
                <SelectItem value="seguradora">Seguradora</SelectItem>
                <SelectItem value="premio">Prêmio (Maior primeiro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Gerar */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório (Landscape)
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            O relatório será gerado em formato horizontal (paisagem) para melhor visualização das colunas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
