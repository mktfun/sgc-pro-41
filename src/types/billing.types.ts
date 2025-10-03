export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'efetivado' | 'pendente';

export interface ChartOfAccounts {
  receita: string[];
  despesa: {
    fixa: string[];
    variavel: string[];
  };
}

export interface BillingTransaction {
  id: string;
  description: string;
  value: number;
  date: string;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  costCenter?: string;
}

export interface BillingMetrics {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  totalPendente: number;
}
