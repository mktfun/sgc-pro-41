import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ChartOfAccounts } from '@/types/billing.types';

const DEFAULT_CHART_OF_ACCOUNTS: ChartOfAccounts = {
  receita: ['Comissão', 'Bonificação', 'Outras Receitas'],
  despesa: {
    fixa: ['Aluguel', 'Salários', 'Pró-labore', 'Software (CRM)', 'Internet'],
    variavel: ['Marketing', 'Comissões de Vendedores', 'Impostos (Simples Nacional)', 'Viagens']
  }
};

export function useChartOfAccounts() {
  const [chartOfAccounts, setChartOfAccounts] = useLocalStorage<ChartOfAccounts>(
    'chart-of-accounts',
    DEFAULT_CHART_OF_ACCOUNTS
  );

  useEffect(() => {
    if (!chartOfAccounts) {
      setChartOfAccounts(DEFAULT_CHART_OF_ACCOUNTS);
    }
  }, [chartOfAccounts, setChartOfAccounts]);

  const getCategories = (type: 'receita' | 'despesa', subtype?: 'fixa' | 'variavel'): string[] => {
    if (type === 'receita') {
      return chartOfAccounts.receita;
    }
    if (subtype) {
      return chartOfAccounts.despesa[subtype];
    }
    return [...chartOfAccounts.despesa.fixa, ...chartOfAccounts.despesa.variavel];
  };

  const getAllDespesas = (): string[] => {
    return [...chartOfAccounts.despesa.fixa, ...chartOfAccounts.despesa.variavel];
  };

  return {
    chartOfAccounts,
    getCategories,
    getAllDespesas
  };
}
