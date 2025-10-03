
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '@/types';
import { useTransactionTypes } from '@/hooks/useAppData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function TransactionModal({ isOpen, onClose, onSubmit }: TransactionModalProps) {
  const { transactionTypes } = useTransactionTypes();
  const [formData, setFormData] = useState({
    typeId: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.typeId || !formData.description || formData.amount <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onSubmit({
      typeId: formData.typeId,
      description: formData.description,
      amount: formData.amount,
      status: 'REALIZADO',
      date: formData.date,
      // 🆕 NOVOS CAMPOS OBRIGATÓRIOS
      nature: 'GANHO', // Valor padrão, pode ser ajustado conforme necessário
      transactionDate: formData.date,
      dueDate: formData.date,
    });
    
    // Reset form
    setFormData({
      typeId: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900/95 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Transação Manual</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout para Formulário */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeId" className="text-white">Tipo de Transação *</Label>
              <select
                id="typeId"
                value={formData.typeId}
                onChange={(e) => handleInputChange('typeId', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-black/20 border border-white/20 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um tipo</option>
                {transactionTypes.map(type => (
                  <option key={type.id} value={type.id} className="bg-slate-800 text-white">
                    {type.name} ({type.nature})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva a transação"
                className="w-full bg-black/20 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/20 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full bg-black/20 border-white/20 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botões Alinhados */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Adicionar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
