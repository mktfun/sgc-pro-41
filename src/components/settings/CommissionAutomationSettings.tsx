import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

export function CommissionAutomationSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const handleToggle = (isChecked: boolean) => {
    updateProfileMutation.mutate(
      { settle_commissions_automatically: isChecked },
      {
        onSuccess: () => {
          toast({
            title: "Configuração atualizada",
            description: `Automação de comissões ${isChecked ? 'ativada' : 'desativada'} com sucesso.`,
          });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a configuração.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value, 10);
    if (!isNaN(days) && days > 0 && days <= 365) {
      updateProfileMutation.mutate(
        { commission_settlement_days: days },
        {
          onSuccess: () => {
            toast({
              title: "Dias atualizados",
              description: `Configurado para ${days} dias após o vencimento.`,
            });
          },
        }
      );
    }
  };

  const handleStrategyChange = (strategy: 'first' | 'all' | 'custom') => {
    updateProfileMutation.mutate(
      { commission_settlement_strategy: strategy },
      {
        onSuccess: () => {
          const strategyNames = {
            first: "Primeira parcela apenas",
            all: "Todas as parcelas",
            custom: "Personalizado"
          };
          toast({
            title: "Estratégia atualizada",
            description: `Configurado para: ${strategyNames[strategy]}`,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="h-4 bg-muted animate-pulse rounded"></div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Automação de Faturamento</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a baixa automática de comissões para reduzir trabalho manual.
        </p>
      </div>

      {/* Toggle Principal */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="automatic-commission" className="font-medium text-foreground">
            Baixa Automática de Comissões
          </Label>
          <p className="text-sm text-muted-foreground">
            Marcar comissões como 'Pagas' automaticamente após o vencimento.
          </p>
        </div>
        <Switch
          id="automatic-commission"
          checked={profile?.settle_commissions_automatically || false}
          onCheckedChange={handleToggle}
          disabled={updateProfileMutation.isPending}
        />
      </div>

      {/* Configurações Avançadas - Só aparecem se automação estiver ativa */}
      {profile?.settle_commissions_automatically && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
          {/* Dias após vencimento */}
          <div className="space-y-2">
            <Label htmlFor="settlement-days" className="font-medium text-foreground">
              Dar baixa após (dias do vencimento)
            </Label>
            <Input
              id="settlement-days"
              type="number"
              min="1"
              max="365"
              defaultValue={profile?.commission_settlement_days || 7}
              onBlur={handleDaysChange}
              disabled={updateProfileMutation.isPending}
              className="w-24"
            />
            <p className="text-sm text-muted-foreground">
              A comissão será marcada como 'Paga' X dias após sua data de vencimento.
            </p>
          </div>

          {/* Estratégia de Parcelas */}
          <div className="space-y-2">
            <Label htmlFor="settlement-strategy" className="font-medium text-foreground">
              Estratégia de Parcelas
            </Label>
            <Select
              value={profile?.commission_settlement_strategy || 'first'}
              onValueChange={handleStrategyChange}
              disabled={updateProfileMutation.isPending}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma estratégia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">Primeira parcela apenas</SelectItem>
                <SelectItem value="all">Todas as parcelas</SelectItem>
                <SelectItem value="custom">Personalizado (em breve)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Define quais parcelas das comissões serão processadas automaticamente.
            </p>
          </div>

          {/* Informação adicional */}
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> Todo dia às 3h da manhã, o sistema verifica comissões 
              pendentes de apólices ativas e as marca como pagas conforme suas configurações.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}