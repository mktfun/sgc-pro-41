import { forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { CRMStage, CRMDeal } from '@/hooks/useCRMDeals';
import { DealCard } from './DealCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/utils/formatCurrency';

interface KanbanColumnProps {
  stage: CRMStage;
  deals: CRMDeal[];
  onAddDeal: () => void;
  onDealClick?: (deal: CRMDeal) => void;
  onEditStage?: (stage: CRMStage) => void;
  onDeleteStage?: (stageId: string) => void;
}

export function KanbanColumn({ 
  stage, 
  deals, 
  onAddDeal, 
  onDealClick,
  onEditStage,
  onDeleteStage
}: KanbanColumnProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: stage.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `column-${stage.id}`,
    data: { type: 'column', stage }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <motion.div
      ref={setSortableRef}
      style={style}
      layout
      layoutId={`column-${stage.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      className={`flex-shrink-0 w-80 ${isDragging ? 'z-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        className="glass-component rounded-xl p-4 mb-3 relative"
        style={{ borderTopColor: stage.color, borderTopWidth: '3px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          {/* Drag Handle for Column */}
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-secondary/50 rounded transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 flex-1">
            <div 
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-foreground truncate">{stage.name}</h3>
          </div>
          
          {/* Badge de contagem */}
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground flex-shrink-0">
            {deals.length}
          </span>

          {/* Menu de Opções */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-component border-border/50">
              <DropdownMenuItem onClick={() => onEditStage?.(stage)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar Etapa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => onDeleteStage?.(stage.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Etapa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Valor Total */}
        {totalValue > 0 && (
          <p className="text-sm text-muted-foreground pl-6">
            {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      {/* Column Body */}
      <div
        ref={setDroppableRef}
        className={`
          min-h-[400px] rounded-xl p-2 transition-all duration-200
          ${isOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-transparent'}
        `}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            <motion.div layout className="space-y-3">
              {deals.map((deal) => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  stageColor={stage.color}
                  onClick={() => onDealClick?.(deal)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </SortableContext>

        {/* Add Deal Button */}
        <Button
          variant="ghost"
          className="w-full mt-3 border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
          onClick={onAddDeal}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Negócio
        </Button>
      </div>
    </motion.div>
  );
}
