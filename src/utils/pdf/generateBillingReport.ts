import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../formatCurrency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ColumnKey = 'date' | 'description' | 'client' | 'type' | 'status' | 'value';

export interface ReportOptions {
  title?: string;
  notes?: string;
  selectedColumns?: ColumnKey[];
  statusFilter?: 'all' | 'paid' | 'pending';
}

interface TransactionRow {
  date: string;
  description: string;
  clientName: string;
  typeName: string;
  policyNumber: string | null;
  status: string;
  amount: number;
  nature: 'GANHO' | 'PERDA';
}

interface ReportMetrics {
  totalGanhos: number;
  totalPerdas: number;
  saldoLiquido: number;
  totalPrevisto: number;
}

interface ReportPeriod {
  from: Date | undefined;
  to: Date | undefined;
}

interface ReportData {
  transactions: TransactionRow[];
  metrics: ReportMetrics;
  period: ReportPeriod;
  options?: ReportOptions;
}

const COLUMN_CONFIG: Record<ColumnKey, { header: string; width: number; align: 'left' | 'center' | 'right' }> = {
  date: { header: 'Data', width: 22, align: 'center' },
  description: { header: 'Descrição', width: 55, align: 'left' },
  client: { header: 'Cliente', width: 40, align: 'left' },
  type: { header: 'Tipo', width: 28, align: 'left' },
  status: { header: 'Status', width: 22, align: 'center' },
  value: { header: 'Valor', width: 28, align: 'right' },
};

export const generateBillingReport = async ({ 
  transactions, 
  metrics, 
  period,
  options = {}
}: ReportData): Promise<void> => {
  const {
    title = 'Relatório de Faturamento',
    notes,
    selectedColumns = ['date', 'description', 'client', 'type', 'status', 'value'],
  } = options;

  const doc = new jsPDF();
  
  // Cores do design system
  const primaryColor: [number, number, number] = [124, 58, 237]; // Violet-600
  const secondaryColor = '#1e293b'; // Slate-800
  const zebraColor: [number, number, number] = [248, 250, 252]; // Slate-50
  
  // 1. Cabeçalho com título personalizado
  doc.setFontSize(22);
  doc.setTextColor(secondaryColor);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  const periodoTexto = period.from && period.to 
    ? `${format(period.from, 'dd/MM/yyyy')} a ${format(period.to, 'dd/MM/yyyy')}`
    : 'Período Total';
    
  doc.text(`Período: ${periodoTexto}`, 14, 28);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 33);

  // Logo/Brand
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SGC Pro', 196, 20, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Sistema de Gestão de Corretora', 196, 25, { align: 'right' });

  // 2. Resumo Financeiro (Cards)
  const startY = 45;
  const boxWidth = 44;
  const boxHeight = 22;
  const gap = 4;
  
  const drawMetricBox = (x: number, label: string, value: number, textColor: string) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'FD');
    
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(label, x + 3, startY + 7);
    
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(value), x + 3, startY + 16);
    doc.setFont('helvetica', 'normal');
  };

  drawMetricBox(14, 'Receitas', metrics.totalGanhos, '#16a34a');
  drawMetricBox(14 + boxWidth + gap, 'Despesas', metrics.totalPerdas, '#dc2626');
  drawMetricBox(14 + (boxWidth + gap) * 2, 'Saldo Líquido', metrics.saldoLiquido, metrics.saldoLiquido >= 0 ? '#16a34a' : '#dc2626');
  drawMetricBox(14 + (boxWidth + gap) * 3, 'Previsto', metrics.totalPrevisto, '#2563eb');

  // 3. Construir colunas dinâmicas
  const orderedColumns = selectedColumns.filter(col => COLUMN_CONFIG[col]);
  
  const headers = orderedColumns.map(col => COLUMN_CONFIG[col].header);
  
  // Função para obter valor de uma coluna
  const getColumnValue = (t: TransactionRow, col: ColumnKey): string => {
    switch (col) {
      case 'date': return t.date;
      case 'description': return t.description;
      case 'client': return t.clientName;
      case 'type': return t.typeName;
      case 'status': return t.status;
      case 'value': return `${t.nature === 'GANHO' ? '+' : '-'} ${formatCurrency(Math.abs(t.amount))}`;
      default: return '-';
    }
  };

  const tableData = transactions.map(t => 
    orderedColumns.map(col => getColumnValue(t, col))
  );

  // Calcular column styles dinamicamente
  const columnStyles: Record<number, { cellWidth: number; halign: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic' }> = {};
  orderedColumns.forEach((col, index) => {
    const config = COLUMN_CONFIG[col];
    columnStyles[index] = {
      cellWidth: config.width,
      halign: config.align,
      ...(col === 'value' ? { fontStyle: 'bold' as const } : {})
    };
  });

  // Índices das colunas especiais para colorização
  const valueColumnIndex = orderedColumns.indexOf('value');
  const statusColumnIndex = orderedColumns.indexOf('status');

  autoTable(doc, {
    startY: startY + boxHeight + 12,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#ffffff',
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: '#334155',
      cellPadding: 2
    },
    columnStyles,
    alternateRowStyles: {
      fillColor: zebraColor
    },
    didParseCell: function(data) {
      // Colorir valores
      if (data.section === 'body' && valueColumnIndex >= 0 && data.column.index === valueColumnIndex) {
        const rawValue = String(data.cell.raw);
        if (rawValue.startsWith('-')) {
          data.cell.styles.textColor = '#dc2626';
        } else {
          data.cell.styles.textColor = '#16a34a';
        }
      }
      // Colorir Status
      if (data.section === 'body' && statusColumnIndex >= 0 && data.column.index === statusColumnIndex) {
        const status = String(data.cell.raw);
        if (status === 'Pago') {
          data.cell.styles.textColor = '#16a34a';
        } else if (status === 'Parcial') {
          data.cell.styles.textColor = '#2563eb';
        } else {
          data.cell.styles.textColor = '#ca8a04';
        }
      }
    },
    foot: [
      orderedColumns.map((col, idx) => {
        if (idx === orderedColumns.length - 2) return 'TOTAL:';
        if (idx === orderedColumns.length - 1) return formatCurrency(metrics.saldoLiquido);
        return '';
      })
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: '#1e293b',
      fontStyle: 'bold',
      halign: 'right',
      fontSize: 9
    }
  });

  // 4. Observações (se houver)
  if (notes) {
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Observações:', 14, finalY + 10);
    doc.setTextColor(60);
    
    // Quebrar texto longo em múltiplas linhas
    const splitNotes = doc.splitTextToSize(notes, 180);
    doc.text(splitNotes, 14, finalY + 16);
  }

  // 5. Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} • Gerado por SGC Pro`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Nome do arquivo semântico
  const monthYear = period.from 
    ? format(period.from, 'MMM_yyyy', { locale: ptBR }).toUpperCase()
    : 'GERAL';
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const fileName = `${safeTitle}_${monthYear}.pdf`;
  
  doc.save(fileName);
};
