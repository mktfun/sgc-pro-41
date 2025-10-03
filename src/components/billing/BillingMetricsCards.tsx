import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { BillingMetrics } from '@/types/billing.types';

interface BillingMetricsCardsProps {
  metrics: BillingMetrics;
}

export function BillingMetricsCards({ metrics }: BillingMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">Total Receitas</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(metrics.totalReceitas)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-400" />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">Total Despesas</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(metrics.totalDespesas)}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-400" />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">Saldo Líquido</p>
            <p className={`text-2xl font-bold ${metrics.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(metrics.saldoLiquido)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-sky-400" />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">Total Pendente</p>
            <p className="text-2xl font-bold text-amber-400">
              {formatCurrency(metrics.totalPendente)}
            </p>
          </div>
          <Clock className="h-8 w-8 text-amber-400" />
        </div>
      </GlassCard>
    </div>
  );
}
