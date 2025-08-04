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
import { EnhancedRenewalStatusChart } from '@/components/reports/enhanced/EnhancedRenewalStatusChart';
import { EnhancedExpirationCalendarChart } from '@/components/reports/enhanced/EnhancedExpirationCalendarChart';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useFilteredDataForReports } from '@/hooks/useFilteredDataForReports';

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

  // ✅ NOVA ARQUITETURA: Loading real do Supabase
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
    dadosRenovacoesPorStatus,
    dadosVencimentosCriticos,
    temFiltrosAtivos,
    temDados,
    isLoading // ✅ Estado real da query
  } = useFilteredDataForReports(filtrosGlobais);

  const handleFiltrosChange = (novosFiltros: FiltrosGlobais) => {
    console.log('🔄 Aplicando novos filtros:', novosFiltros);
    setFiltrosGlobais(novosFiltros);
    // ❌ REMOVIDO: setTimeout falso - agora o loading é real
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Sala de Guerra - Relatórios Gerenciais</h1>
        <p className="text-slate-400">
          Central de inteligência para análise completa da carteira e tomada de decisões estratégicas
        </p>
      </div>

      {/* SISTEMA DE FILTROS AVANÇADOS */}
      <FiltrosAvancados
        filtros={filtrosGlobais}
        onFiltrosChange={handleFiltrosChange}
        seguradoras={seguradoras}
        ramos={ramosDisponiveis}
        produtores={produtores}
        statusDisponiveis={statusDisponiveis}
      />

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="space-y-6">
        {isLoading ? (
          // ✅ LOADING REAL: Skeletons baseados no estado da query
          <>
            <SkeletonKpiReports />
            <SkeletonKpiReports />
            <SkeletonEnhancedCharts />
          </>
        ) : !temDados ? (
          // ESTADO VAZIO
          <EstadoVazio 
            onLimparFiltros={clearAllFilters}
            temFiltrosAtivos={temFiltrosAtivos}
          />
        ) : (
          // DADOS CARREGADOS
          <>
            {/* WIDGETS DE RELATÓRIO EXISTENTES */}
            <VisaoGeralCarteira 
              clientes={clientesFiltrados} 
              apolices={apolicesFiltradas} 
            />
            
            <RelatorioFaturamento 
              apolices={apolicesFiltradas}
              clientes={clientesFiltrados}
              transactions={transacoesFiltradas}
              intervalo={filtrosGlobais.intervalo}
            />

            {/* NOVA SEÇÃO DE GRÁFICOS APRIMORADOS */}
            <div className="flex flex-col gap-6">
              {/* LINHA 1: GRÁFICO PRINCIPAL EM DESTAQUE - RENOVAÇÕES CRÍTICAS */}
              <EnhancedRenewalStatusChart
                data={dadosRenovacoesPorStatus.data}
                insight={dadosRenovacoesPorStatus.insight}
              />
              
              {/* LINHA 2: CARROSSEL COM GRÁFICOS SECUNDÁRIOS APRIMORADOS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Análises Avançadas e Detalhadas
                  </h3>
                  <p className="text-sm text-slate-400">
                    Arraste para navegar • Gráficos interativos com métricas expandidas
                  </p>
                </div>
                
                <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                  
                  <CarouselContent>
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedGrowthChart
                          data={dadosEvolucaoCarteira.data}
                          dateRange={filtrosGlobais.intervalo}
                          insight={dadosEvolucaoCarteira.insight}
                        />
                      </div>
                    </CarouselItem>
                    
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedProducerPerformanceChart
                          data={dadosPerformanceProdutor.data}
                          insight={dadosPerformanceProdutor.insight}
                        />
                      </div>
                    </CarouselItem>
                    
                    <CarouselItem>
                      <div className="h-full">
                        <EnhancedExpirationCalendarChart
                          data={dadosVencimentosCriticos.data}
                          insight={dadosVencimentosCriticos.insight}
                        />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
            </div>

            {/* ÁREA DE EXPANSÃO FUTURA */}
            <PlaceholderGraficos />
          </>
        )}
      </div>
    </div>
  );
}
