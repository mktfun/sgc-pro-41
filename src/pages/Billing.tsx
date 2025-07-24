
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { useTransactions } from '@/hooks/useAppData';
import { TransactionList } from '@/components/billing/TransactionList';
import { TransactionModal } from '@/components/billing/TransactionModal';
import { Transaction } from '@/types';

export default function Billing() {
  const { transactions, addTransaction, updateTransaction, loading } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPrevisto = transactions
    .filter(t => t.status === 'PREVISTO')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRealizado = transactions
    .filter(t => t.status === 'REALIZADO' || t.status === 'PAGO')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPendente = transactions
    .filter(t => ['PENDENTE', 'PARCIALMENTE_PAGO'].includes(t.status))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(transaction);
  };

  const handleMarkAsRealized = (id: string) => {
    updateTransaction(id, { status: 'REALIZADO' });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Faturamento</h1>
              <p className="text-gray-600">Acompanhe todas as transações financeiras da corretora</p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Adicionar Transação Manual
            </Button>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Previsto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPrevisto.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Realizado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRealizado.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendente/Parcial</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPendente.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Transações</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de Transações */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Todas as Transações
            </h2>
            <TransactionList 
              transactions={transactions}
              onMarkAsRealized={handleMarkAsRealized}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddTransaction}
      />
    </Layout>
  );
}
