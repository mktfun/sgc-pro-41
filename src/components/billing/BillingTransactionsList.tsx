import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BillingTransaction } from '@/types/billing.types';
import { Trash2, TrendingUp, TrendingDown, Calendar, Tag, Building2 } from 'lucide-react';
import { useBillingTransactions } from '@/hooks/useBillingTransactions';
import { toast } from '@/hooks/use-toast';

interface BillingTransactionsListProps {
  transactions: BillingTransaction[];
}

export function BillingTransactionsList({ transactions }: BillingTransactionsListProps) {
  const { deleteTransaction } = useBillingTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Deseja realmente excluir a transação "${description}"?`)) {
      deleteTransaction(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso."
      });
    }
  };

  if (transactions.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-white/60">
          Nenhuma transação encontrada. Adicione sua primeira transação clicando no botão "Nova Transação".
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <GlassCard key={transaction.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {transaction.type === 'receita' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <h4 className="font-medium text-white">{transaction.description}</h4>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{transaction.category}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(transaction.date)}</span>
                </div>

                {transaction.costCenter && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{transaction.costCenter}</span>
                  </div>
                )}

                <Badge variant={transaction.status === 'efetivado' ? 'default' : 'outline'}>
                  {transaction.status === 'efetivado' ? 'Efetivado' : 'Pendente'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-xl font-bold ${transaction.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(transaction.id, transaction.description)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
