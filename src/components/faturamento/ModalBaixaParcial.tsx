import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useAppData';
import { toast } from '@/hooks/use-toast';

interface ModalBaixaParcialProps {
  transaction: Transaction;
  onSuccess?: () => void;
}

interface FormData {
  amountPaid: number;
  description?: string;
}

export function ModalBaixaParcial({ transaction, onSuccess }: ModalBaixaParcialProps) {
  const [open, setOpen] = useState(false);
  const { addPartialPayment } = useTransactions();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      if (data.amountPaid <= 0) {
        toast({
          title: "Erro",
          description: "O valor pago deve ser maior que zero",
          variant: "destructive"
        });
        return;
      }

      if (data.amountPaid > transaction.amount) {
        toast({
          title: "Erro", 
          description: "O valor pago não pode ser maior que o valor total da transação",
          variant: "destructive"
        });
        return;
      }

      await addPartialPayment(
        transaction.id, 
        data.amountPaid, 
        data.description || `Pagamento parcial de ${data.amountPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      );
      
      toast({
        title: "Sucesso!",
        description: "Baixa parcial registrada com sucesso",
        variant: "default"
      });

      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao registrar baixa parcial:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar baixa parcial. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'PENDENTE':
        return 'text-yellow-400 border-yellow-500';
      case 'PARCIALMENTE_PAGO':
        return 'text-blue-400 border-blue-500';
      case 'PAGO':
        return 'text-green-400 border-green-500';
      default:
        return 'text-gray-400 border-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <CreditCard size={14} />
          Baixa Parcial
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Registrar Baixa Parcial</DialogTitle>
        </DialogHeader>
        
        {/* Informações da Transação */}
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Transação</h4>
            <Badge variant="outline" className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Descrição:</span>
              <span className="text-white">{transaction.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valor Total:</span>
              <span className="text-green-400 font-bold">
                {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vencimento:</span>
              <span className="text-white">
                {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amountPaid" className="flex items-center gap-2">
              <DollarSign size={16} />
              Valor Pago
            </Label>
            <Input
              id="amountPaid"
              type="number"
              step="0.01"
              min="0.01"
              max={transaction.amount}
              placeholder="0,00"
              {...register('amountPaid', { 
                required: 'Valor pago é obrigatório',
                min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                max: { value: transaction.amount, message: 'Valor não pode ser maior que o total' }
              })}
            />
            {errors.amountPaid && (
              <p className="text-sm text-red-400 mt-1">{errors.amountPaid.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-2">
              <Calendar size={16} />
              Observações (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Pagamento via PIX, Boleto bancário..."
              {...register('description')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Registrando...</>
              ) : (
                <>
                  <CreditCard size={16} />
                  Registrar Baixa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
