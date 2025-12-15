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
import { FileDown, Loader2, Download, Calendar } from 'lucide-react';
import { generateManagementReport, ManagementReportData, ReportOptions } from '@/utils/pdf/generateManagementReport';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportManagementModalProps {
  dateRange: DateRange | undefined;
  portfolio: ManagementReportData['portfolio'];
  financial: ManagementReportData['financial'];
  branchDistribution: ManagementReportData['branchDistribution'];
  companyDistribution: ManagementReportData['companyDistribution'];
  producerPerformance: ManagementReportData['producerPerformance'];
  disabled?: boolean;
}

const SECTION_OPTIONS = [
  { key: 'kpis', label: 'Visão Geral (KPIs)' },
  { key: 'financial', label: 'Resumo Financeiro' },
  { key: 'branches', label: 'Detalhamento por Ramo' },
  { key: 'companies', label: 'Detalhamento por Seguradora' },
  { key: 'producers', label: 'Detalhamento por Produtor' },
] as const;

type SectionKey = typeof SECTION_OPTIONS[number]['key'];

export function ExportManagementModal({
  dateRange,
  portfolio,
  financial,
  branchDistribution,
  companyDistribution,
  producerPerformance,
  disabled
}: ExportManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('Relatório de Gestão');
  const [notes, setNotes] = useState('');
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([
    'kpis', 'financial', 'branches', 'companies', 'producers'
  ]);

  const handleSectionToggle = (section: SectionKey) => {
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleGenerate = async () => {
    if (selectedSections.length === 0) {
      toast.error('Selecione ao menos uma seção para o relatório.');
      return;
    }

    setIsGenerating(true);
    try {
      const options: ReportOptions = {
        title,
        notes: notes.trim() || undefined,
        sections: {
          kpis: selectedSections.includes('kpis'),
          financial: selectedSections.includes('financial'),
          branches: selectedSections.includes('branches'),
          companies: selectedSections.includes('companies'),
          producers: selectedSections.includes('producers'),
        }
      };

      await generateManagementReport({
        period: { from: dateRange?.from, to: dateRange?.to },
        portfolio,
        financial,
        branchDistribution,
        companyDistribution,
        producerPerformance
      }, options);

      toast.success('Relatório de Gestão gerado com sucesso!');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('Relatório de Gestão');
    setNotes('');
    setSelectedSections(['kpis', 'financial', 'branches', 'companies', 'producers']);
  };

  const formatPeriod = () => {
    if (!dateRange?.from) return 'Período não definido';
    const fromStr = format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    const toStr = dateRange.to 
      ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
      : fromStr;
    return `${fromStr} a ${toStr}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          disabled={disabled}
        >
          <FileDown className="h-4 w-4" />
          Baixar Relatório Gerencial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Relatório de Gestão</DialogTitle>
          <DialogDescription>
            Personalize o conteúdo do seu relatório antes de exportar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Período */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Período: <strong className="text-foreground">{formatPeriod()}</strong>
            </span>
          </div>

          {/* Personalização */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Personalização</h4>
            <div className="space-y-2">
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Relatório de Gestão"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionais que aparecerão no final do relatório..."
                rows={2}
              />
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Seções do Relatório</h4>
            <div className="space-y-2">
              {SECTION_OPTIONS.map((section) => (
                <div key={section.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.key}
                    checked={selectedSections.includes(section.key)}
                    onCheckedChange={() => handleSectionToggle(section.key)}
                  />
                  <Label htmlFor={section.key} className="font-normal cursor-pointer">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{selectedSections.length}</strong> seções selecionadas
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || selectedSections.length === 0}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
