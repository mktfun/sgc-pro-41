import { usePageTitle } from '@/hooks/usePageTitle';
import { useFilteredPolicies } from '@/hooks/useFilteredPolicies';
import { useClients } from '@/hooks/useAppData';
import { useCompanyNames } from '@/hooks/useCompanyNames';
import { useProducerNames } from '@/hooks/useProducerNames';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Calendar, Building, FileText, Filter, X, Loader2, Calculator, ArrowRight, Ban, ArrowUp, ArrowDown, User, Upload, MoreHorizontal, Eye, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { PolicyFormModal } from '@/components/policies/PolicyFormModal';
import { BudgetConversionModal } from '@/components/policies/BudgetConversionModal';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePolicies } from '@/hooks/useAppData';

export default function Policies() {
  usePageTitle('Apólices e Orçamentos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingPolicyId, setUploadingPolicyId] = useState<string | null>(null);
  const [activatingPolicyId, setActivatingPolicyId] = useState<string | null>(null);
  const { clients, loading: isLoadingClients } = useClients();
  const { updatePolicy } = usePolicies();
  const { getCompanyName } = useCompanyNames();
  const { getProducerName } = useProducerNames();
  const navigate = useNavigate();
  
  const { 
    filters, 
    setFilters, 
    filteredPolicies, 
    uniqueInsuranceCompanies,
    producers,
    resetFilters,
    totalPolicies,
    isLoading: isLoadingPolicies,
    sortConfig,
    handleSort
  } = useFilteredPolicies();

  const isLoading = isLoadingPolicies || isLoadingClients;

  const filterOptions = [
    { value: 'todos', label: 'Todos os Períodos' },
    { value: 'current-month', label: 'Este Mês' },
    { value: 'next-30-days', label: 'Próximos 30 dias' },
    { value: 'next-90-days', label: 'Próximos 90 dias' },
    { value: 'expired', label: 'Vencidas' }
  ];

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Orçamento', label: 'Orçamentos' },
    { value: 'Ativa', label: 'Ativas' },
    { value: 'Aguardando Apólice', label: 'Aguardando Apólice' }
  ];

  const handleRowClick = (policyId: string) => {
    console.log('🖱️ Clicando na apólice:', policyId);
    navigate(`/policies/${policyId}`);
  };

  const handleCancelPolicy = async (policyId: string) => {
    try {
      await updatePolicy(policyId, { status: 'Cancelada' });
      console.log('Apólice cancelada com sucesso');
    } catch (error) {
      console.error('Erro ao cancelar apólice:', error);
    }
  };

  const handleActivatePolicy = async (policyId: string) => {
    setActivatingPolicyId(policyId);
    try {
      await updatePolicy(policyId, { status: 'Ativa' });
      console.log('Apólice ativada manualmente com sucesso');
    } catch (error) {
      console.error('Erro ao ativar apólice:', error);
    } finally {
      setActivatingPolicyId(null);
    }
  };

  const handleFileUpload = async (policyId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPolicyId(policyId);
    
    try {
      // Aqui você pode implementar a lógica de upload
      // Por enquanto, simular um delay e ativar a apólice
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updatePolicy(policyId, { status: 'Ativa' });
      console.log('PDF anexado e apólice ativada');
    } catch (error) {
      console.error('Erro ao anexar PDF:', error);
    } finally {
      setUploadingPolicyId(null);
      // Reset do input
      event.target.value = '';
    }
  };

  const isExpiringIn60Days = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.status !== 'todos' || 
    filters.insuranceCompany !== 'todas' || 
    filters.period !== 'todos' ||
    filters.producerId !== 'todos';

  const budgets = filteredPolicies.filter(p => p.status === 'Orçamento');
  const policies = filteredPolicies.filter(p => p.status !== 'Orçamento');

  const renderSortableHeader = (key: string, label: string) => {
    const isActive = sortConfig.key === key;
    const isAsc = sortConfig.direction === 'asc';
    
    return (
      <TableHead 
        className="text-white font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-2">
          {label}
          {isActive && (
            isAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />
          )}
        </div>
      </TableHead>
    );
  };

  const renderContextualActions = (policy: any) => {
    const client = clients.find(c => c.id === policy.clientId);

    if (policy.status === 'Orçamento') {
      return (
        <BudgetConversionModal
          budgetId={policy.id}
          budgetDescription={`${getCompanyName(policy.insuranceCompany)} - ${policy.type}`}
          onConversionSuccess={() => {
            // Optionally refresh data or show success message
          }}
        >
          <Button variant="default" size="sm" className="flex items-center gap-2">
            <ArrowRight size={14} />
            Converter
          </Button>
        </BudgetConversionModal>
      );
    }

    if (policy.status === 'Aguardando Apólice') {
      return (
        <div className="flex items-center gap-2">
          <label htmlFor={`pdf-upload-${policy.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 cursor-pointer"
              disabled={uploadingPolicyId === policy.id || activatingPolicyId === policy.id}
            >
              {uploadingPolicyId === policy.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {uploadingPolicyId === policy.id ? 'Anexando...' : 'Anexar PDF'}
            </Button>
          </label>
          <input
            id={`pdf-upload-${policy.id}`}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileUpload(policy.id, e)}
          />

          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={uploadingPolicyId === policy.id || activatingPolicyId === policy.id}
            onClick={(e) => {
              e.stopPropagation();
              handleActivatePolicy(policy.id);
            }}
          >
            {activatingPolicyId === policy.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            {activatingPolicyId === policy.id ? 'Ativando...' : 'Ativar'}
          </Button>
        </div>
      );
    }

    if (policy.status === 'Ativa') {
      const isExpiringSoon = isExpiringIn60Days(policy.expirationDate);
      
      if (isExpiringSoon) {
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate(`/policies/${policy.id}?action=renew`)}
            >
              <AlertTriangle size={14} />
              Iniciar Renovação
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
                <DropdownMenuItem 
                  onClick={() => navigate(`/policies/${policy.id}`)}
                  className="text-white hover:bg-white/10"
                >
                  <Eye size={14} className="mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleCancelPolicy(policy.id)}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Ban size={14} className="mr-2" />
                  Cancelar Apólice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      } else {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <MoreHorizontal size={14} />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
              <DropdownMenuItem 
                onClick={() => navigate(`/policies/${policy.id}`)}
                className="text-white hover:bg-white/10"
              >
                <Eye size={14} className="mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate(`/policies/${policy.id}?action=renew`)}
                className="text-white hover:bg-white/10"
              >
                <RotateCcw size={14} className="mr-2" />
                Renovar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleCancelPolicy(policy.id)}
                className="text-red-400 hover:bg-red-500/10"
              >
                <Ban size={14} className="mr-2" />
                Cancelar Apólice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }

    if (policy.status === 'Renovada' || policy.status === 'Cancelada') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => navigate(`/policies/${policy.id}`)}
        >
          <Eye size={14} />
          Ver Histórico
        </Button>
      );
    }

    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => navigate(`/policies/${policy.id}`)}
      >
        <Eye size={14} />
        Ver Detalhes
      </Button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Apólices e Orçamentos</h1>
          <p className="text-white/60">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Carregando...
              </span>
            ) : (
              <>
                {filteredPolicies.length} de {totalPolicies} registros
                {hasActiveFilters && ' (filtrados)'} • 
                {budgets.length} orçamentos • {policies.length} apólices
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isLoading}>
                <Plus size={16} />
                Nova Apólice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Cadastrar Nova Apólice</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <PolicyFormModal 
                  onClose={() => setIsModalOpen(false)}
                  onPolicyAdded={() => {
                    // Refresh the policies list after successful creation
                    console.log('Nova apólice adicionada, lista será atualizada');
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SettingsPanel>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Search size={16} className="text-white/60" />
                <label className="text-sm font-medium text-white">Buscar</label>
              </div>
              <Input
                placeholder="Buscar por número da apólice ou nome do cliente..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-white/60" />
                  <label className="text-sm font-medium text-white">Período</label>
                </div>
                <Select 
                  value={filters.period} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white">
                    {filterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-white/10 focus:bg-white/10">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building size={16} className="text-white/60" />
                  <label className="text-sm font-medium text-white">Seguradora</label>
                </div>
                <Select 
                  value={filters.insuranceCompany} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, insuranceCompany: value }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Selecione a seguradora" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white">
                    <SelectItem value="todas" className="hover:bg-white/10 focus:bg-white/10">
                      Todas as Seguradoras
                    </SelectItem>
                    {uniqueInsuranceCompanies.map(company => (
                      <SelectItem key={company} value={company} className="hover:bg-white/10 focus:bg-white/10">
                        {getCompanyName(company)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-white/60" />
                  <label className="text-sm font-medium text-white">Produtor</label>
                </div>
                <Select 
                  value={filters.producerId} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, producerId: value }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Selecione o produtor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white">
                    <SelectItem value="todos" className="hover:bg-white/10 focus:bg-white/10">
                      Todos os Produtores
                    </SelectItem>
                    {producers.map(producer => (
                      <SelectItem key={producer.id} value={producer.id} className="hover:bg-white/10 focus:bg-white/10">
                        {producer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter size={16} className="text-white/60" />
                  <label className="text-sm font-medium text-white">Status</label>
                </div>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white">
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-white/10 focus:bg-white/10">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X size={16} className="mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    Busca: "{filters.searchTerm}"
                  </Badge>
                )}
                {filters.period !== 'todos' && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {filterOptions.find(f => f.value === filters.period)?.label}
                  </Badge>
                )}
                {filters.insuranceCompany !== 'todas' && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {getCompanyName(filters.insuranceCompany)}
                  </Badge>
                )}
                {filters.producerId !== 'todos' && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {getProducerName(filters.producerId)}
                  </Badge>
                )}
                {filters.status !== 'todos' && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {statusOptions.find(s => s.value === filters.status)?.label}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {hasActiveFilters ? 'Registros Filtrados' : 'Todas as Apólices e Orçamentos'}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  <>
                    {filteredPolicies.length} registro{filteredPolicies.length !== 1 ? 's' : ''} encontrado{filteredPolicies.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-white/40 mb-4">
                  <Loader2 size={48} className="mx-auto animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Carregando...</h3>
                <p className="text-white/60">Aguarde enquanto buscamos seus dados.</p>
              </div>
            ) : filteredPolicies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-700 hover:bg-transparent">
                    <TableHead className="text-white font-semibold">Tipo</TableHead>
                    <TableHead className="text-white font-semibold">ID/Número</TableHead>
                    {renderSortableHeader('clientName', 'Cliente')}
                    {renderSortableHeader('insuranceCompany', 'Seguradora')}
                    {renderSortableHeader('producerName', 'Produtor')}
                    {renderSortableHeader('type', 'Ramo')}
                    {renderSortableHeader('premiumValue', 'Valor')}
                    {renderSortableHeader('expirationDate', 'Vencimento')}
                    {renderSortableHeader('status', 'Status')}
                    <TableHead className="text-white font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => {
                    const client = clients.find(c => c.id === policy.clientId);
                    const isBudget = policy.status === 'Orçamento';

                    return (
                      <TableRow 
                        key={policy.id} 
                        className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(policy.id)}
                      >
                        <TableCell className="text-slate-300">
                          {isBudget ? (
                            <Calculator size={16} className="text-blue-400" />
                          ) : (
                            <FileText size={16} className="text-green-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300 font-mono">
                          {policy.policyNumber || `ORÇ-${policy.id.slice(-8)}`}
                        </TableCell>
                        <TableCell className="text-slate-300 font-medium">
                          {client ? client.name : 'Cliente não encontrado'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {getCompanyName(policy.insuranceCompany)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {getProducerName(policy.producerId)}
                        </TableCell>
                        <TableCell className="text-slate-300">{policy.type}</TableCell>
                        <TableCell className="text-slate-300">
                          {policy.premiumValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(policy.expirationDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={policy.status === 'Ativa' ? 'default' : 'secondary'}
                            className={
                              policy.status === 'Ativa' 
                                ? 'bg-green-600/80 text-white hover:bg-green-700/80' 
                                : policy.status === 'Orçamento'
                                ? 'bg-blue-600/80 text-white hover:bg-blue-700/80'
                                : policy.status === 'Cancelada'
                                ? 'bg-red-600/80 text-white hover:bg-red-700/80'
                                : 'bg-yellow-600/80 text-white hover:bg-yellow-700/80'
                            }
                          >
                            {policy.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {renderContextualActions(policy)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/40 mb-4">
                  <FileText size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {hasActiveFilters ? 'Nenhum registro encontrado' : 'Nenhuma apólice ou orçamento cadastrado'}
                </h3>
                <p className="text-white/60 mb-4">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros para encontrar os registros desejados.'
                    : 'Comece cadastrando sua primeira apólice ou orçamento.'
                  }
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={resetFilters} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <X size={16} className="mr-2" />
                    Limpar Filtros
                  </Button>
                ) : (
                  <Button className="flex items-center gap-2 mx-auto" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} />
                    Nova Apólice
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}
