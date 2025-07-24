
import { Transaction } from '@/types';
import { TransactionCard } from './TransactionCard';
import { GlassCard } from '@/components/ui/glass-card';
import { AlertTriangle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onMarkAsRealized?: (id: string) => void;
  loading?: boolean;
}

export function TransactionList({ transactions, onMarkAsRealized, loading }: TransactionListProps) {
  if (loading) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-white/60">
          Carregando transações...
        </div>
      </GlassCard>
    );
  }

  if (transactions.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-white/40 mb-4">
          <AlertTriangle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          Nenhuma transação encontrada
        </h3>
        <p className="text-white/60">
          As transações de comissão serão criadas automaticamente quando as apólices forem ativadas.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onMarkAsRealized={onMarkAsRealized || (() => {})}
        />
      ))}
    </div>
  );
}
