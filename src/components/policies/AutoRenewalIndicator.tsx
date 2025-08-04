
import React from 'react';
import { RotateCcw, Calendar, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AutoRenewalIndicatorProps {
  automaticRenewal: boolean;
  expirationDate: string;
  size?: 'sm' | 'md';
}

export function AutoRenewalIndicator({ 
  automaticRenewal, 
  expirationDate,
  size = 'sm' 
}: AutoRenewalIndicatorProps) {
  if (!automaticRenewal) return null;

  const renewalDate = new Date(expirationDate);
  renewalDate.setDate(renewalDate.getDate() - 15); // 15 dias antes
  
  const isUpcoming = renewalDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Próximos 30 dias

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isUpcoming ? "default" : "secondary"} 
        className={`${size === 'md' ? 'px-3 py-1' : 'px-2 py-0.5'} flex items-center gap-1`}
      >
        <RotateCcw className="w-3 h-3" />
        Renovação Automática
      </Badge>
      
      {isUpcoming && (
        <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-300">
          <Calendar className="w-3 h-3" />
          Agendamento em {renewalDate.toLocaleDateString('pt-BR')}
        </Badge>
      )}
    </div>
  );
}
