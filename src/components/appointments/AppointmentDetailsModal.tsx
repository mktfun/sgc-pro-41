
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText, CheckCircle, RotateCcw, X } from 'lucide-react';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { useClients } from '@/hooks/useAppData';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RecurrenceConfig } from './RecurrenceConfig';
import { AppCard } from '@/components/ui/app-card';

interface AppointmentDetailsModalProps {
  appointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsModal({ appointment, open, onOpenChange }: AppointmentDetailsModalProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showRecurrenceConfig, setShowRecurrenceConfig] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(appointment?.recurrence_rule || null);
  const { updateAppointment, addAppointment } = useSupabaseAppointments();
  const { clients } = useClients();
  const { toast } = useToast();

  if (!appointment) return null;

  const client = clients.find(c => c.id === appointment.client_id);
  const isCompleted = appointment.status === 'Realizado';
  const isCanceled = appointment.status === 'Cancelado';
  const isPending = appointment.status === 'Pendente';

  const calculateNextDate = (currentDate: string, currentTime: string, rule: string) => {
    const baseDate = new Date(`${currentDate}T${currentTime}`);
    
    if (rule.includes('FREQ=DAILY')) {
      const interval = rule.match(/INTERVAL=(\d+)/);
      return addDays(baseDate, interval ? parseInt(interval[1]) : 1);
    } else if (rule.includes('FREQ=WEEKLY')) {
      const interval = rule.match(/INTERVAL=(\d+)/);
      return addWeeks(baseDate, interval ? parseInt(interval[1]) : 1);
    } else if (rule.includes('FREQ=MONTHLY')) {
      const interval = rule.match(/INTERVAL=(\d+)/);
      return addMonths(baseDate, interval ? parseInt(interval[1]) : 1);
    } else if (rule.includes('FREQ=YEARLY')) {
      const interval = rule.match(/INTERVAL=(\d+)/);
      return addYears(baseDate, interval ? parseInt(interval[1]) : 1);
    }
    
    return addYears(baseDate, 1);
  };

  const handleConcluirAgendamento = async () => {
    if (!isPending) return;

    setIsCompleting(true);
    try {
      await updateAppointment(appointment.id, {
        status: 'Realizado',
        recurrence_rule: recurrenceRule
      });

      if (recurrenceRule) {
        const nextDate = calculateNextDate(appointment.date, appointment.time, recurrenceRule);
        
        await addAppointment({
          client_id: appointment.client_id,
          policy_id: appointment.policy_id,
          title: appointment.title,
          date: format(nextDate, 'yyyy-MM-dd'),
          time: format(nextDate, 'HH:mm'),
          status: 'Pendente',
          notes: appointment.notes,
          recurrence_rule: recurrenceRule,
          parent_appointment_id: appointment.id
        });

        toast({
          title: "Sucesso",
          description: "Agendamento concluído e próximo agendamento criado!"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Agendamento marcado como realizado!"
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelarAgendamento = async () => {
    if (!isPending) return;

    setIsCanceling(true);
    try {
      await updateAppointment(appointment.id, {
        status: 'Cancelado'
      });

      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso!"
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao cancelar agendamento",
        variant: "destructive"
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Realizado':
        return 'bg-green-600 text-green-100';
      case 'Cancelado':
        return 'bg-red-600 text-red-100';
      case 'Pendente':
        return 'bg-blue-600 text-blue-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Realizado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Cancelado':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-transparent border-none p-0">
        <AppCard className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-start">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
              {getStatusIcon(appointment.status)}
            </div>

            {/* Título do Agendamento */}
            <div>
              <h3 className="text-lg font-semibold text-white">{appointment.title}</h3>
            </div>

            {/* Informações de Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-slate-300">
                  {format(new Date(appointment.date), 'PPP', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-slate-300">{appointment.time}</span>
              </div>
            </div>

            {/* Cliente */}
            {client && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-slate-300">{client.name}</span>
              </div>
            )}

            {/* Observações */}
            {appointment.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-slate-300">Observações:</span>
                </div>
                <p className="text-sm text-slate-400 pl-6">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Configuração de Recorrência */}
            {isPending && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecurrenceConfig(!showRecurrenceConfig)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {showRecurrenceConfig ? 'Ocultar' : 'Configurar'} Renovação
                  </Button>
                  {appointment.recurrence_rule && (
                    <Badge variant="outline" className="border-blue-600 text-blue-400">
                      Agendamento Recorrente
                    </Badge>
                  )}
                </div>

                {showRecurrenceConfig && (
                  <RecurrenceConfig
                    onRecurrenceChange={setRecurrenceRule}
                    initialRecurrence={appointment.recurrence_rule}
                  />
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Fechar
              </Button>
              {isPending && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelarAgendamento}
                    disabled={isCanceling}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    {isCanceling ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                  <Button
                    onClick={handleConcluirAgendamento}
                    disabled={isCompleting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCompleting ? 'Concluindo...' : 'Concluir Agendamento'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </AppCard>
      </DialogContent>
    </Dialog>
  );
}
