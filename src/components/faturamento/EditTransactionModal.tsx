import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseRamos } from '@/hooks/useSupabaseRamos';
import { useSupabaseCompanies } from '@/hooks/useSupabaseCompanies';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil } from 'lucide-react';
import { Transaction } from '@/types';

interface EditTransactionModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTransactionModal({ 
  transactionId, 
  isOpen, 
  onClose,
  onSuccess 
}: EditTransactionModalProps) {
  const { toast } = useToast();
  const [ramoId, setRamoId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Buscar dados da transação específica
  const { data: transaction, isLoading: loadingTransaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error('Erro ao buscar transação:', error);
        throw error;
      }

      return data;
    },
    enabled: !!transactionId && isOpen,
  });

  // Buscar listas para os dropdowns
  const { data: ramos = [] } = useSupabaseRamos();
  const { companies } = useSupabaseCompanies();

  // Preencher o formulário quando os dados da transação chegam
  useEffect(() => {
    if (transaction) {
      setRamoId(transaction.ramo_id || '');
      setCompanyId(transaction.company_id || '');
      setStatus(transaction.status || 'PENDENTE');
    }
  }, [transaction]);

  // Resetar formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setRamoId('');
      setCompanyId('');
      setStatus('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!transactionId) return;

    try {
      setIsUpdating(true);

      const updates: any = {
        ramo_id: ramoId || null,
        company_id: companyId || null,
        status: status,
      };

      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Transação atualizada com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a transação.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editar Transação
          </DialogTitle>
        </DialogHeader>

        {loadingTransaction ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-slate-400">Carregando dados...</span>
          </div>
        ) : transaction ? (
          <div className="space-y-6">
            {/* Informações da Transação */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="font-semibold text-white mb-2">Detalhes da Transação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="text-white font-medium">{transaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor:</span>
                  <span className={`font-bold ${transaction.nature === 'RECEITA' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data:</span>
                  <span className="text-white">{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-white">{transaction.status}</span>
                </div>
              </div>
            </div>

            {/* Campos de Edição */}
            <div className="space-y-4">
              {/* Select Ramo */}
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">
                  Ramo <span className="text-slate-500">(opcional)</span>
                </Label>
                <Select value={ramoId} onValueChange={setRamoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ramo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ramos.map(ramo => (
                      <SelectItem key={ramo.id} value={ramo.id}>
                        {ramo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Seguradora */}
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">
                  Seguradora <span className="text-slate-500">(opcional)</span>
                </Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma seguradora" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Status */}
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="PARCIALMENTE_PAGO">Parcialmente Pago</SelectItem>
                    <SelectItem value="ATRASADO">Atrasado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            Transação não encontrada
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating || !transaction}>
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
