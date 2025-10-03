import { useLocalStorage } from './useLocalStorage';
import { BillingTransaction, BillingMetrics } from '@/types/billing.types';

export function useBillingTransactions() {
  const [transactions, setTransactions] = useLocalStorage<BillingTransaction[]>(
    'billing-transactions',
    []
  );

  const addTransaction = (transaction: Omit<BillingTransaction, 'id'>) => {
    const newTransaction: BillingTransaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    setTransactions([...transactions, newTransaction]);
    return newTransaction;
  };

  const updateTransaction = (id: string, updates: Partial<BillingTransaction>) => {
    setTransactions(
      transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id);
  };

  const getMetrics = (): BillingMetrics => {
    const totalReceitas = transactions
      .filter(t => t.type === 'receita' && t.status === 'efetivado')
      .reduce((sum, t) => sum + t.value, 0);

    const totalDespesas = transactions
      .filter(t => t.type === 'despesa' && t.status === 'efetivado')
      .reduce((sum, t) => sum + t.value, 0);

    const totalPendente = transactions
      .filter(t => t.status === 'pendente')
      .reduce((sum, t) => {
        return t.type === 'receita' ? sum + t.value : sum - t.value;
      }, 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      totalPendente
    };
  };

  const filterTransactions = (filters: {
    type?: 'receita' | 'despesa';
    status?: 'efetivado' | 'pendente';
    category?: string;
    costCenter?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return transactions.filter(t => {
      if (filters.type && t.type !== filters.type) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.costCenter && t.costCenter !== filters.costCenter) return false;
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo && t.date > filters.dateTo) return false;
      return true;
    });
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getMetrics,
    filterTransactions
  };
}
