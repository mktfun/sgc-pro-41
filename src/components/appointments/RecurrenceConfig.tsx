
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

interface RecurrenceConfigProps {
  onRecurrenceChange: (recurrenceRule: string | null) => void;
  initialRecurrence?: string | null;
}

export function RecurrenceConfig({ onRecurrenceChange, initialRecurrence }: RecurrenceConfigProps) {
  const [frequency, setFrequency] = useState<string>(() => {
    if (!initialRecurrence) return 'none';
    if (initialRecurrence.includes('FREQ=DAILY')) return 'daily';
    if (initialRecurrence.includes('FREQ=WEEKLY')) return 'weekly';
    if (initialRecurrence.includes('FREQ=MONTHLY')) return 'monthly';
    if (initialRecurrence.includes('FREQ=YEARLY')) return 'yearly';
    return 'none';
  });

  const [interval, setInterval] = useState<number>(() => {
    if (!initialRecurrence) return 1;
    const match = initialRecurrence.match(/INTERVAL=(\d+)/);
    return match ? parseInt(match[1]) : 1;
  });

  const handleFrequencyChange = (newFrequency: string) => {
    setFrequency(newFrequency);
    updateRecurrenceRule(newFrequency, interval);
  };

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    updateRecurrenceRule(frequency, newInterval);
  };

  const updateRecurrenceRule = (freq: string, int: number) => {
    if (freq === 'none') {
      onRecurrenceChange(null);
      return;
    }

    const freqMap = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY'
    };

    const rule = `FREQ=${freqMap[freq as keyof typeof freqMap]};INTERVAL=${int}`;
    onRecurrenceChange(rule);
  };

  const getFrequencyLabel = () => {
    switch (frequency) {
      case 'daily': return 'dia(s)';
      case 'weekly': return 'semana(s)';
      case 'monthly': return 'mês(es)';
      case 'yearly': return 'ano(s)';
      default: return '';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <RotateCcw className="h-4 w-4" />
          Repetir Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="frequency" className="text-slate-300">Frequência</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não repetir</SelectItem>
              <SelectItem value="daily">Diariamente</SelectItem>
              <SelectItem value="weekly">Semanalmente</SelectItem>
              <SelectItem value="monthly">Mensalmente</SelectItem>
              <SelectItem value="yearly">Anualmente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {frequency !== 'none' && (
          <div>
            <Label htmlFor="interval" className="text-slate-300">
              Repetir a cada
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="interval"
                type="number"
                min="1"
                max="999"
                value={interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="bg-slate-800 border-slate-600 text-white w-20"
              />
              <span className="text-slate-300 text-sm">{getFrequencyLabel()}</span>
            </div>
          </div>
        )}

        {frequency !== 'none' && (
          <div className="bg-blue-900/20 border border-blue-600 p-3 rounded-lg">
            <p className="text-blue-300 text-sm">
              Este agendamento será repetido automaticamente quando for concluído.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
