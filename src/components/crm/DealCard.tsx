import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, DollarSign, MoreVertical, Trash2 } from 'lucide-react';
import { CRMDeal, useCRMDeals } from '@/hooks/useCRMDeals';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DealCardProps {
  deal: CRMDeal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const { deleteDeal } = useCRMDeals();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    deleteDeal.mutate(deal.id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        glass-component rounded-xl p-4 cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'shadow-2xl ring-2 ring-primary/50' : 'shadow-lg'}
        ${isSortableDragging ? 'opacity-50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-foreground line-clamp-2 flex-1 pr-2">
          {deal.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Client Info */}
      {deal.client && (
        <div className="mb-3 p-2 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 text-sm text-foreground mb-1">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium truncate">{deal.client.name}</span>
          </div>
          {deal.client.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{deal.client.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Value & Date */}
      <div className="flex items-center justify-between text-sm">
        {deal.value > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="font-semibold">{formatCurrency(deal.value)}</span>
          </div>
        )}
        {deal.expected_close_date && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">
              {format(new Date(deal.expected_close_date), 'dd MMM', { locale: ptBR })}
            </span>
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {deal.notes && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {deal.notes}
        </p>
      )}

      {/* Sync Indicator */}
      {deal.chatwoot_conversation_id && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-muted-foreground">Sincronizado</span>
        </div>
      )}
    </motion.div>
  );
}
