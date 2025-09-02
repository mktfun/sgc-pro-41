import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { getCurrentMonthRange } from '@/utils/dateUtils';
import { VisaoGeralCarteira } from '@/components/reports/VisaoGeralCarteira';
import { RelatorioFaturamento } from '@/components/reports/RelatorioFaturamento';
import { FiltrosAvancados } from '@/components/reports/FiltrosAvancados';
import { SkeletonKpiReports } from '@/components/reports/SkeletonKpiReports';
import { SkeletonEnhancedCharts } from '@/components/reports/SkeletonEnhancedCharts';
import { EstadoVazio } from '@/components/reports/EstadoVazio';
import { PlaceholderGraficos } from '@/components/reports/PlaceholderGraficos';
import { EnhancedGrowthChart } from '@/components/reports/enhanced/EnhancedGrowthChart';
import { EnhancedProducerPerformanceChart } from '@/components/reports/enhanced/EnhancedProducerPerformanceChart';
import { EnhancedExpirationCalendarChart } from '@/components/reports/enhanced/EnhancedExpirationCalendarChart';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useFilteredDataForReports } from '@/hooks/useFilteredDataForReports';
import { useClientesPreview } from '@/hooks/useClientesPreview';
import { useApolicesPreview } from '@/hooks/useApolicesPreview';
import PreviewCard from '@/components/PreviewCard';

interface FiltrosGlobais {
  intervalo: DateRange | undefined;
  seguradoraIds: string[];
  ramos: string[];
  produtorIds: string[];
  statusIds: string[];
}

export default function Reports() {
  const [filtrosGlobais, setFiltrosGlobais] = useState<FiltrosGlobais>({
    intervalo: getCurrentMonthRange(),
    seguradoraIds: [],
    ramos: [],
    produtorIds: [],
    statusIds: [],
  });

  const previewFilters = {
    seguradoraId: (filtrosGlobais.seguradoraIds && filtrosGlobais.seguradoraIds[0]) || null,
    ramo: (filtrosGlobais.ramos && filtrosGlobais.ramos[0]) || null,
  } as const;
  const { data: clientesPreview } = useClientesPreview(previewFilters);
  const { data: apolicesPreview } = useApolicesPreview(previewFilters);
  const isFilterActive = Boolean(
    (filtrosGlobais.seguradoraIds && filtrosGlobais.seguradoraIds.length > 0) ||
    (filtrosGlobais.ramos && filtrosGlobais.ramos.length > 0)
  );

  const { 
    apolicesFiltradas, 
    clientesFiltrados,
    transacoesFiltradas,
    seguradoras,
    ramosDisponiveis,
    statusDisponiveis,
    produtores,
    dadosEvolucaoCarteira,
    dadosPerformanceProdutor,
    dadosVencimentosCriticos,
    temFiltrosAtivos,
    temDados,
    isLoading
  } = useFilteredDataForReports(filtrosGlobais);

  const handleFiltrosChange = (novosFiltros: FiltrosGlobais) => {
    setFiltrosGlobais(novosFiltros);
  };

  const clearAllFilters = () => {
    handleFiltrosChange({
      intervalo: filtrosGlobais.intervalo,
      seguradoraIds: [],
      ramos: [],
      produtorIds: [],
      statusIds: []
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
        <p className="text-slate-400">Central de inteligência para análise completa da carteira e tomada de decisões estratégicas</p>
      </div>

      <FiltrosAvancados
        filtros={filtrosGlobais}
        onFiltrosChange={handleFiltrosChange}
        seguradoras={seguradoras}
        ramos={ramosDisponiveis}
        produtores={produtores}
        statusDisponiveis={statusDisponiveis}
      />

      <div className="space-y-6">
        {isLoading ? (
          <>
            <SkeletonKpiReports />
            <SkeletonKpiReports />
            <SkeletonEnhancedCharts />
          </>
        ) : !temDados ? (
          <EstadoVazio onLimparFiltros={clearAllFilters} temFiltrosAtivos={temFiltrosAtivos} />
        ) : (
          <>
            <VisaoGeralCarteira clientes={clientesFiltrados} apolices={apolicesFiltradas} />
            <RelatorioFaturamento apolices={apolicesFiltradas} clientes={clientesFiltrados} transactions={transacoesFiltradas} intervalo={filtrosGlobais.intervalo} />
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Análises Avançadas e Detalhadas</h3>
                  <p className="text-sm text-slate-400">Arraste para navegar • Gráficos interativos com métricas expandidas</p>
                </div>
                <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                  <CarouselContent>
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedGrowthChart data={dadosEvolucaoCarteira.data} dateRange={filtrosGlobais.intervalo} insight={dadosEvolucaoCarteira.insight} />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedProducerPerformanceChart data={dadosPerformanceProdutor.data} insight={dadosPerformanceProdutor.insight} />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedExpirationCalendarChart data={dadosVencimentosCriticos.data} insight={dadosVencimentosCriticos.insight} />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
            <PlaceholderGraficos />
          </>
        )}
      </div>

      {isFilterActive && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PreviewCard
            title="Clientes Encontrados"
            data={clientesPreview}
            linkTo="/dashboard/clients"
            filters={previewFilters}
            extraParams={{
              start: filtrosGlobais.intervalo?.from ? filtrosGlobais.intervalo.from.toISOString().split('T')[0] : '',
              end: filtrosGlobais.intervalo?.to ? filtrosGlobais.intervalo.to.toISOString().split('T')[0] : '',
            }}
          />
          <PreviewCard
            title="Apólices Encontradas"
            data={apolicesPreview}
            linkTo="/dashboard/policies"
            filters={previewFilters}
            extraParams={{
              start: filtrosGlobais.intervalo?.from ? filtrosGlobais.intervalo.from.toISOString().split('T')[0] : '',
              end: filtrosGlobais.intervalo?.to ? filtrosGlobais.intervalo.to.toISOString().split('T')[0] : '',
            }}
          />
        </div>
      )}
    </div>
  );
}
