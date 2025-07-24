import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { useClients, usePolicies } from '@/hooks/useAppData';
import { useSupabaseCompanies } from '@/hooks/useSupabaseCompanies';
import { useSupabaseProducers } from '@/hooks/useSupabaseProducers';
import { useSupabaseBrokerages } from '@/hooks/useSupabaseBrokerages';
import { useSupabaseCompanyBranches } from '@/hooks/useSupabaseCompanyBranches';
import { Separator } from '@/components/ui/separator';

// ✅ OPERAÇÃO VIRA-LATA: Schema atualizado para permitir orçamentos sem seguradora/ramo
const policySchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  insuranceCompany: z.string().optional(), // 🎯 AGORA É OPCIONAL
  type: z.string().optional(), // 🎯 AGORA É OPCIONAL
  policyNumber: z.string().optional(),
  insuredAsset: z.string().min(1, 'Bem segurado é obrigatório'),
  premiumValue: z.number().min(0, 'Valor do prêmio deve ser positivo'),
  commissionRate: z.number().min(0).max(100, 'Taxa de comissão deve estar entre 0 e 100'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  expirationDate: z.string().optional(),
  status: z.enum(['Orçamento', 'Aguardando Apólice', 'Ativa']),
  producerId: z.string().optional(),
  brokerageId: z.string().optional(),
}).superRefine((data, ctx) => {
  // 🎯 VALIDAÇÃO CONDICIONAL: Para apólices ativas, seguradora e ramo são obrigatórios
  if (data.status === 'Ativa' || data.status === 'Aguardando Apólice') {
    if (!data.insuranceCompany || data.insuranceCompany.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Seguradora é obrigatória para apólices ativas',
        path: ['insuranceCompany']
      });
    }
    
    if (!data.type || data.type.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ramo é obrigatório para apólices ativas',
        path: ['type']
      });
    }
  }
});

type PolicyFormData = z.infer<typeof policySchema>;

interface PolicyFormModalProps {
  onClose: () => void;
  onPolicyAdded?: () => void;
}

export function PolicyFormModal({ onClose, onPolicyAdded }: PolicyFormModalProps) {
  const { clients } = useClients();
  const { addPolicy } = usePolicies();
  const { companies } = useSupabaseCompanies();
  const { producers } = useSupabaseProducers();
  const { brokerages } = useSupabaseBrokerages();
  const { companyBranches } = useSupabaseCompanyBranches();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      status: 'Orçamento',
      commissionRate: 20,
      insuredAsset: '',
    }
  });

  const selectedCompanyId = watch('insuranceCompany');
  const availableBranches = companyBranches.filter(branch => branch.companyId === selectedCompanyId);
  const currentStatus = watch('status');

  const onSubmit = async (data: PolicyFormData) => {
    setIsSubmitting(true);
    try {
      // TODA A INTELIGÊNCIA VIVE AQUI. O FORMULÁRIO É BURRO.
      const finalData = {
        ...data,
        brokerageId: data.brokerageId ? parseInt(data.brokerageId) : undefined,
        // O VALOR DE 'expirationDate' É CRIADO AQUI, E SÓ AQUI.
        expirationDate: format(addYears(new Date(data.startDate), 1), 'yyyy-MM-dd'),
      };

      await addPolicy(finalData);
      reset();
      onPolicyAdded?.();
      onClose();
    } catch (error) {
      console.error('Erro ao criar apólice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name} - ${client.phone}`
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seleção de Cliente com Busca */}
      <div>
        <Label htmlFor="clientId" className="text-white">Cliente *</Label>
        <Combobox
          options={clientOptions}
          value={watch('clientId')}
          onValueChange={(value) => setValue('clientId', value)}
          placeholder="Buscar e selecionar cliente..."
          searchPlaceholder="Digite o nome ou telefone do cliente..."
          emptyText="Nenhum cliente encontrado."
          className="mt-1"
        />
        {errors.clientId && (
          <p className="text-red-400 text-sm mt-1">{errors.clientId.message}</p>
        )}
      </div>

      {/* Dados da Apólice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="insuranceCompany" className="text-white">
            Seguradora {currentStatus !== 'Orçamento' && '*'}
          </Label>
          <Select value={watch('insuranceCompany')} onValueChange={(value) => setValue('insuranceCompany', value)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Selecione a seguradora" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-slate-700 text-white">
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id} className="hover:bg-white/10 focus:bg-white/10">
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.insuranceCompany && (
            <p className="text-red-400 text-sm mt-1">{errors.insuranceCompany.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type" className="text-white">
            Ramo {currentStatus !== 'Orçamento' && '*'}
          </Label>
          <Select value={watch('type')} onValueChange={(value) => setValue('type', value)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Selecione o ramo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-slate-700 text-white">
              {availableBranches.map((branch) => (
                <SelectItem key={branch.id} value={branch.name} className="hover:bg-white/10 focus:bg-white/10">
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="policyNumber" className="text-white">Número da Apólice</Label>
          <Input
            {...register('policyNumber')}
            className="bg-slate-900/50 border-slate-700 text-white mt-1"
            placeholder="Ex: 12345678"
          />
        </div>

        <div>
          <Label htmlFor="status" className="text-white">Status *</Label>
          <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-slate-700 text-white">
              <SelectItem value="Orçamento" className="hover:bg-white/10 focus:bg-white/10">Orçamento</SelectItem>
              <SelectItem value="Aguardando Apólice" className="hover:bg-white/10 focus:bg-white/10">Aguardando Apólice</SelectItem>
              <SelectItem value="Ativa" className="hover:bg-white/10 focus:bg-white/10">Ativa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="insuredAsset" className="text-white">Bem Segurado *</Label>
        <Textarea
          {...register('insuredAsset')}
          className="bg-slate-900/50 border-slate-700 text-white mt-1"
          placeholder="Descreva o bem segurado..."
          rows={3}
        />
        {errors.insuredAsset && (
          <p className="text-red-400 text-sm mt-1">{errors.insuredAsset.message}</p>
        )}
      </div>

      <Separator className="bg-slate-700" />

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="premiumValue" className="text-white">Valor do Prêmio *</Label>
          <Input
            {...register('premiumValue', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="bg-slate-900/50 border-slate-700 text-white mt-1"
            placeholder="0,00"
          />
          {errors.premiumValue && (
            <p className="text-red-400 text-sm mt-1">{errors.premiumValue.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="commissionRate" className="text-white">Taxa de Comissão (%) *</Label>
          <Input
            {...register('commissionRate', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="bg-slate-900/50 border-slate-700 text-white mt-1"
            placeholder="20"
          />
          {errors.commissionRate && (
            <p className="text-red-400 text-sm mt-1">{errors.commissionRate.message}</p>
          )}
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-white">Data de Início *</Label>
          <Input
            {...register('startDate')}
            type="date"
            className="bg-slate-900/50 border-slate-700 text-white mt-1"
          />
          {errors.startDate && (
            <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
          )}
        </div>
        
        {/* O CAMPO DE INPUT DE DATA DE VENCIMENTO FOI PRO INFERNO. ELE NÃO EXISTE MAIS. */}
        <div>
          <Label className="text-white">Data de Vencimento</Label>
          <div className="mt-1 flex h-10 w-full items-center rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-gray-400">
            Calculada automaticamente (+1 ano)
          </div>
        </div>
      </div>

      {/* Produtor e Corretora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="producerId" className="text-white">Produtor</Label>
          <Select value={watch('producerId')} onValueChange={(value) => setValue('producerId', value)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Selecione o produtor" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-slate-700 text-white">
              {producers.map((producer) => (
                <SelectItem key={producer.id} value={producer.id} className="hover:bg-white/10 focus:bg-white/10">
                  {producer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="brokerageId" className="text-white">Corretora</Label>
          <Select value={watch('brokerageId')} onValueChange={(value) => setValue('brokerageId', value)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Selecione a corretora" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-lg border-slate-700 text-white">
              {brokerages.map((brokerage) => (
                <SelectItem key={brokerage.id} value={brokerage.id.toString()} className="hover:bg-white/10 focus:bg-white/10">
                  {brokerage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="bg-slate-700 text-white hover:bg-slate-600"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Apólice'}
        </Button>
      </div>
    </form>
  );
}
