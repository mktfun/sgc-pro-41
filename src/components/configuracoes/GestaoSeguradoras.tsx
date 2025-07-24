
import { useState } from 'react';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanies, useCompanyBranches } from '@/hooks/useAppData';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export function GestaoSeguradoras() {
  const [companyName, setCompanyName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [branchName, setBranchName] = useState('');
  
  const { 
    companies, 
    loading: companiesLoading, 
    addCompany, 
    isAdding: isAddingCompany 
  } = useCompanies();
  
  const { 
    companyBranches, 
    loading: branchesLoading, 
    addCompanyBranch, 
    isAdding: isAddingBranch 
  } = useCompanyBranches();

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      try {
        const newCompany = await addCompany({ name: companyName.trim() });
        setCompanyName('');
        setSelectedCompanyId(newCompany.id);
      } catch (error) {
        console.error('Erro ao criar seguradora:', error);
      }
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompanyId && branchName.trim()) {
      try {
        await addCompanyBranch({
          companyId: selectedCompanyId,
          name: branchName.trim()
        });
        setBranchName('');
      } catch (error) {
        console.error('Erro ao criar ramo:', error);
      }
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const selectedCompanyBranches = companyBranches.filter(
    branch => branch.companyId === selectedCompanyId
  );

  if (companiesLoading || branchesLoading) {
    return (
      <SettingsPanel
        title="Seguradoras e Ramos"
        description="Gerencie as seguradoras e seus ramos de seguro"
        icon={Building2}
      >
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-slate-300">Carregando seguradoras...</span>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Seguradoras e Ramos"
      description="Gerencie as seguradoras e seus ramos de seguro"
      icon={Building2}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna da Esquerda - Lista de Seguradoras (Mestre) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Seguradoras</h3>
            <span className="text-sm text-slate-400">({companies.length})</span>
          </div>

          {/* Formulário para Nova Seguradora */}
          <form onSubmit={handleAddCompany} className="flex gap-2">
            <Input
              placeholder="Nome da nova seguradora"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              disabled={isAddingCompany}
            />
            <Button type="submit" disabled={!companyName.trim() || isAddingCompany}>
              {isAddingCompany ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </>
              )}
            </Button>
          </form>

          {/* Lista de Seguradoras */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {companies.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Building2 className="mx-auto h-12 w-12 text-slate-600 mb-2" />
                <p>Nenhuma seguradora cadastrada</p>
              </div>
            ) : (
              companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCompanyId === company.id
                      ? 'bg-blue-500/20 border-blue-400/50 ring-2 ring-blue-400/30'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{company.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      {companyBranches.filter(b => b.companyId === company.id).length} ramos
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna da Direita - Detalhes da Seguradora (Detalhe) */}
        <div className="space-y-4">
          {selectedCompany ? (
            <>
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-lg text-white">{selectedCompany.name}</h3>
                <p className="text-sm text-slate-400">Ramos de Seguro</p>
              </div>

              {/* Formulário para Novo Ramo */}
              <form onSubmit={handleAddBranch} className="flex gap-2">
                <Input
                  placeholder="Nome do novo ramo"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  disabled={isAddingBranch}
                />
                <Button type="submit" disabled={!branchName.trim() || isAddingBranch}>
                  {isAddingBranch ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Ramo
                    </>
                  )}
                </Button>
              </form>

              {/* Lista de Ramos */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedCompanyBranches.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-sm">Nenhum ramo cadastrado para esta seguradora</p>
                  </div>
                ) : (
                  selectedCompanyBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <span className="font-medium text-white">{branch.name}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Building2 className="mx-auto h-16 w-16 text-slate-600 mb-4" />
              <p className="text-lg font-medium mb-2 text-white">Selecione uma Seguradora</p>
              <p className="text-sm">Clique em uma seguradora à esquerda para gerenciar seus ramos</p>
            </div>
          )}
        </div>

      </div>
    </SettingsPanel>
  );
}
