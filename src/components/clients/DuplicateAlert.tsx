
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface DuplicateAlertProps {
  count: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

export function DuplicateAlert({ count, highConfidence, mediumConfidence, lowConfidence }: DuplicateAlertProps) {
  if (count === 0) return null;

  return (
    <Alert className="border-yellow-500/20 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="flex items-center gap-2">
        <span className="text-yellow-200">
          {count} possíveis clientes duplicados encontrados
        </span>
        <div className="flex gap-1">
          {highConfidence > 0 && (
            <Badge variant="destructive" className="text-xs">
              {highConfidence} alta confiança
            </Badge>
          )}
          {mediumConfidence > 0 && (
            <Badge variant="default" className="text-xs">
              {mediumConfidence} média confiança
            </Badge>
          )}
          {lowConfidence > 0 && (
            <Badge variant="secondary" className="text-xs">
              {lowConfidence} baixa confiança
            </Badge>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
