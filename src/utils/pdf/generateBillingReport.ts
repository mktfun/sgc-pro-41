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

// Sanitize description to NEVER show "undefined"
const sanitizeDescription = (desc: string | null | undefined, typeName: string, policyNumber: string | null): string => {
  if (!desc || desc.trim() === '' || desc.includes('undefined') || desc === 'undefined') {
    if (policyNumber) {
      return `Comissão Apólice ${policyNumber}`;
    }
    return typeName || 'Lançamento Manual';
  }
  return desc.replace(/undefined/gi, '').trim() || typeName || 'Lançamento';
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
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Design System Colors
  const primaryColor: [number, number, number] = [124, 58, 237]; // Violet-600
  const headerBgColor: [number, number, number] = [51, 65, 85]; // Slate-700
  const shadowColor: [number, number, number] = [203, 213, 225]; // Slate-300
  const cardBgColor: [number, number, number] = [255, 255, 255];
  
  // ========================================
  // 1. PREMIUM HEADER BAND
  // ========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  // Brand name - left aligned, white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SGC Pro', 14, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão de Corretora', 14, 26);
  
  // Report title - right aligned
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - 14, 18, { align: 'right' });
  
  // Period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const periodoTexto = period.from && period.to 
    ? `${format(period.from, 'dd/MM/yyyy')} a ${format(period.to, 'dd/MM/yyyy')}`
    : 'Período Total';
  doc.text(`Período: ${periodoTexto}`, pageWidth - 14, 28, { align: 'right' });
  
  // Generation date
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 255);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth - 14, 36, { align: 'right' });

  // ========================================
  // 2. METRIC CARDS WITH SHADOW EFFECT
  // ========================================
  const startY = 52;
  const boxWidth = 44;
  const boxHeight = 26;
  const gap = 4;
  const startX = 14;
  
  const drawMetricCard = (x: number, label: string, value: number, valueColor: string, iconColor: [number, number, number]) => {
    // Shadow effect
    doc.setFillColor(...shadowColor);
    doc.roundedRect(x + 1.5, startY + 1.5, boxWidth, boxHeight, 3, 3, 'F');
    
    // Card background
    doc.setFillColor(...cardBgColor);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 3, 3, 'FD');
    
    // Icon circle
    doc.setFillColor(...iconColor);
    doc.circle(x + 7, startY + 9, 3, 'F');
    
    // Label
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + 13, startY + 10);
    
    // Value
    doc.setFontSize(12);
    doc.setTextColor(valueColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(value), x + 4, startY + 21);
    doc.setFont('helvetica', 'normal');
  };

  drawMetricCard(startX, 'Receitas', metrics.totalGanhos, '#16a34a', [34, 197, 94]); // Green
  drawMetricCard(startX + boxWidth + gap, 'Despesas', metrics.totalPerdas, '#dc2626', [239, 68, 68]); // Red
  drawMetricCard(startX + (boxWidth + gap) * 2, 'Saldo Líquido', metrics.saldoLiquido, metrics.saldoLiquido >= 0 ? '#16a34a' : '#dc2626', metrics.saldoLiquido >= 0 ? [34, 197, 94] : [239, 68, 68]);
  drawMetricCard(startX + (boxWidth + gap) * 3, 'Previsto', metrics.totalPrevisto, '#2563eb', [59, 130, 246]); // Blue

  // ========================================
  // 3. EXECUTIVE TABLE
  // ========================================
  const orderedColumns = selectedColumns.filter(col => COLUMN_CONFIG[col]);
  const headers = orderedColumns.map(col => COLUMN_CONFIG[col].header);
  
  const getColumnValue = (t: TransactionRow, col: ColumnKey): string => {
    switch (col) {
      case 'date': return t.date;
      case 'description': return sanitizeDescription(t.description, t.typeName, t.policyNumber);
      case 'client': return t.clientName || 'Não informado';
      case 'type': return t.typeName || 'Transação';
      case 'status': return t.status;
      case 'value': return `${t.nature === 'GANHO' ? '+' : '-'} ${formatCurrency(Math.abs(t.amount))}`;
      default: return '-';
    }
  };

  const tableData = transactions.map(t => 
    orderedColumns.map(col => getColumnValue(t, col))
  );

  // Column styles
  const columnStyles: Record<number, { cellWidth: number; halign: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' }> = {};
  orderedColumns.forEach((col, index) => {
    const config = COLUMN_CONFIG[col];
    columnStyles[index] = {
      cellWidth: config.width,
      halign: config.align,
      ...(col === 'value' ? { fontStyle: 'bold' as const } : {})
    };
  });

  const valueColumnIndex = orderedColumns.indexOf('value');
  const statusColumnIndex = orderedColumns.indexOf('status');

  autoTable(doc, {
    startY: startY + boxHeight + 14,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: headerBgColor, // Slate-700 for executive look
      textColor: '#ffffff',
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8,
      textColor: '#334155',
      cellPadding: 3
    },
    columnStyles,
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    didParseCell: function(data) {
      // Color values
      if (data.section === 'body' && valueColumnIndex >= 0 && data.column.index === valueColumnIndex) {
        const rawValue = String(data.cell.raw);
        if (rawValue.startsWith('-')) {
          data.cell.styles.textColor = '#dc2626';
        } else {
          data.cell.styles.textColor = '#16a34a';
        }
      }
      // Color status
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
      fontSize: 10,
      cellPadding: 4
    }
  });

  // ========================================
  // 4. NOTES SECTION (if provided)
  // ========================================
  if (notes) {
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    
    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY + 8, pageWidth - 14, finalY + 8);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 14, finalY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 28);
    doc.text(splitNotes, 14, finalY + 23);
  }

  // ========================================
  // 5. PROFESSIONAL FOOTER ON ALL PAGES
  // ========================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
    
    // Legal text
    doc.setFontSize(7);
    doc.setTextColor(130);
    doc.text(
      `Documento gerado eletronicamente em ${format(new Date(), 'dd/MM/yyyy HH:mm')} via SGC Pro`,
      14,
      pageHeight - 10
    );
    
    // Pagination
    doc.text(
      `Pág ${i} de ${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // ========================================
  // 6. SAVE FILE
  // ========================================
  const monthYear = period.from 
    ? format(period.from, 'MMM_yyyy', { locale: ptBR }).toUpperCase()
    : 'GERAL';
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const fileName = `${safeTitle}_${monthYear}.pdf`;
  
  doc.save(fileName);
};
