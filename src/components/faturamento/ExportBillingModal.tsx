import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Loader2 } from 'lucide-react';
import { generateBillingReport, ReportOptions, ColumnKey } from '@/utils/pdf/generateBillingReport';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Client, Policy, TransactionType } from '@/types';
import { DateRange } from 'react-day-picker';

interface ExportBillingModalProps {
  transactions: Transaction[];
  metrics: {
    totalGanhos: number;
    totalPerdas: number;
    saldoLiquido: number;
    totalPrevisto: number;
  };
  dateRange: DateRange | undefined;
  clients: Client[];
  policies: Policy[];
  transactionTypes: TransactionType[];
  disabled?: boolean;
}

const COLUMN_OPTIONS: { key: ColumnKey; label: string }[] = [
  { key: 'date', label: 'Data' },
  { key: 'description', label: 'Descrição' },
  { key: 'client', label: 'Cliente' },
  { key: 'type', label: 'Tipo' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Valor' },
];

export function ExportBillingModal({
  transactions,
  metrics,
  dateRange,
  clients,
  policies,
  transactionTypes,
  disabled
}: ExportBillingModalProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('Relatório de Faturamento');
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedColumns, setSelectedColumns] = useState<ColumnKey[]>(['date', 'description', 'client', 'type', 'status', 'value']);
  
  const { toast } = useToast();

  const handleColumnToggle = (column: ColumnKey) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleGenerate = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Selecione ao menos uma coluna",
        description: "É necessário selecionar pelo menos uma coluna para o relatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Filtrar transações por status
      let filteredTransactions = [...transactions];
      if (statusFilter === 'paid') {
        filteredTransactions = transactions.filter(t => t.status === 'PAGO');
      } else if (statusFilter === 'pending') {
        filteredTransactions = transactions.filter(t => t.status === 'PENDENTE' || t.status === 'PARCIALMENTE_PAGO');
      }

      if (filteredTransactions.length === 0) {
        toast({
          title: "Sem dados para exportar",
          description: "Não há transações com o filtro selecionado.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Recalcular métricas baseado no filtro
      const filteredMetrics = filteredTransactions.reduce((acc, t) => {
        const transactionType = transactionTypes.find(tt => tt.id === t.typeId);
        const isGanho = transactionType?.nature === 'GANHO';
        const amount = Math.abs(t.amount);
        
        if (t.status === 'PAGO') {
          if (isGanho) acc.totalGanhos += amount;
          else acc.totalPerdas += amount;
        } else {
          acc.totalPrevisto += isGanho ? amount : -amount;
        }
        
        return acc;
      }, { totalGanhos: 0, totalPerdas: 0, totalPrevisto: 0, saldoLiquido: 0 });
      
      filteredMetrics.saldoLiquido = filteredMetrics.totalGanhos - filteredMetrics.totalPerdas;

      // Transformar dados
      const reportTransactions = filteredTransactions.map(t => {
        const client = clients.find(c => c.id === t.clientId);
        const transactionType = transactionTypes.find(tt => tt.id === t.typeId);
        const policy = policies.find(p => p.id === t.policyId);
        
        return {
          date: new Date(t.date).toLocaleDateString('pt-BR'),
          description: t.description || 'Sem descrição',
          clientName: client?.name || '-',
          typeName: transactionType?.name || 'Transação',
          policyNumber: policy?.policyNumber || null,
          status: t.status === 'PAGO' ? 'Pago' : t.status === 'PARCIALMENTE_PAGO' ? 'Parcial' : 'Pendente',
          amount: t.amount,
          nature: (transactionType?.nature || 'GANHO') as 'GANHO' | 'PERDA'
        };
      });

      const options: ReportOptions = {
        title,
        notes: notes.trim() || undefined,
        selectedColumns,
        statusFilter
      };

      await generateBillingReport({
        transactions: reportTransactions,
        metrics: filteredMetrics,
        period: {
          from: dateRange?.from,
          to: dateRange?.to
        },
        options
      });

      toast({
        title: "Relatório gerado",
        description: "O download do PDF foi iniciado.",
      });

      setOpen(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('Relatório de Faturamento');
    setNotes('');
    setStatusFilter('all');
    setSelectedColumns(['date', 'description', 'client', 'type', 'status', 'value']);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-slate-200 hover:bg-white/20 gap-2"
          disabled={disabled || !transactions?.length}
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Relatório de Faturamento</DialogTitle>
          <DialogDescription>
            Personalize o conteúdo e formato do seu relatório antes de exportar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seção 1 - Personalização */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Personalização</h4>
            <div className="space-y-2">
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Relatório de Faturamento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionais que aparecerão no rodapé do relatório..."
                rows={2}
              />
            </div>
          </div>

          {/* Seção 2 - Filtros */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Filtrar por Status</h4>
            <RadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'paid' | 'pending')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">Todos os status</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="font-normal cursor-pointer">Apenas Pagos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="font-normal cursor-pointer">Apenas Pendentes</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seção 3 - Colunas */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Colunas do Relatório</h4>
            <div className="grid grid-cols-2 gap-3">
              {COLUMN_OPTIONS.map((col) => (
                <div key={col.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={col.key}
                    checked={selectedColumns.includes(col.key)}
                    onCheckedChange={() => handleColumnToggle(col.key)}
                  />
                  <Label htmlFor={col.key} className="font-normal cursor-pointer">
                    {col.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || selectedColumns.length === 0}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Relatório'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
