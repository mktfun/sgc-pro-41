
import { AppCard } from '@/components/ui/app-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/useAppData';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Building } from 'lucide-react';

interface FiltrosFaturamentoProps {
  selectedPeriod: string;
  selectedCompany: string;
  onPeriodChange: (period: string) => void;
  onCompanyChange: (company: string) => void;
}

export function FiltrosFaturamento({
  selectedPeriod,
  selectedCompany,
  onPeriodChange,
  onCompanyChange
}: FiltrosFaturamentoProps) {
  const { companies } = useCompanies();

  const periodOptions = [
    { value: 'all', label: 'Todos os Períodos' },
    { value: 'current-month', label: 'Mês Atual' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'current-year', label: 'Ano Atual' },
    { value: 'last-year', label: 'Ano Passado' }
  ];

  return (
    <AppCard className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={16} className="text-white/60" />
            <label className="text-sm font-medium text-white">Período</label>
          </div>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="bg-black/20 border-white/20 text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white z-50">
              {periodOptions.map(option => (
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
          <Select value={selectedCompany} onValueChange={onCompanyChange}>
            <SelectTrigger className="bg-black/20 border-white/20 text-white">
              <SelectValue placeholder="Todas as seguradoras" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-white/20 text-white z-50">
              <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">Todas as Seguradoras</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id} className="hover:bg-white/10 focus:bg-white/10">
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(selectedPeriod !== 'all' || selectedCompany !== 'all') && (
          <div className="flex items-end">
            <div className="flex gap-2 flex-wrap">
              {selectedPeriod !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                  {periodOptions.find(p => p.value === selectedPeriod)?.label}
                </Badge>
              )}
              {selectedCompany !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                  {companies.find(c => c.id === selectedCompany)?.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </AppCard>
  );
}
