import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Plus, Calendar, AlertTriangle, MapPin } from 'lucide-react';
import { useCreateSinistro } from '@/hooks/useSinistros';
import { useClients, usePolicies } from '@/hooks/useAppData';
import { format } from 'date-fns';

const sinistroSchema = z.object({
  policy_id: z.string().min(1, 'Selecione uma apólice'),
  client_id: z.string().optional(),
  occurrence_date: z.string().min(1, 'Data da ocorrência é obrigatória'),
  claim_type: z.string().min(1, 'Tipo do sinistro é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  location_occurrence: z.string().optional(),
  circumstances: z.string().optional(),
  police_report_number: z.string().optional(),
  claim_amount: z.string().optional(),
  deductible_amount: z.string().optional(),
  priority: z.string().optional(),
});

type SinistroFormData = z.infer<typeof sinistroSchema>;

const claimTypes = [
  'Colisão',
  'Roubo', 
  'Furto',
  'Incêndio',
  'Danos Elétricos',
  'Enchente',
  'Granizo',
  'Vandalismo',
  'Quebra de Vidros',
  'Assistência 24h',
  'Outros'
];

const priorities = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Urgente', label: 'Urgente' },
];

interface SinistroFormModalProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function SinistroFormModal({ children, onSuccess }: SinistroFormModalProps) {
  const [open, setOpen] = useState(false);
  const createSinistro = useCreateSinistro();
  const { clients = [] } = useClients();
  const { policies = [] } = usePolicies();

  const form = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroSchema),
    defaultValues: {
      occurrence_date: format(new Date(), 'yyyy-MM-dd'),
      priority: 'Média',
      claim_amount: '',
      deductible_amount: '',
    },
  });

  const selectedPolicyId = form.watch('policy_id');
  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  // Auto-preenche o cliente quando uma apólice é selecionada
  const handlePolicyChange = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    if (policy?.client_id) {
      form.setValue('client_id', policy.client_id);
    }
  };

  const onSubmit = async (data: SinistroFormData) => {
    try {
      const submitData = {
        ...data,
        claim_amount: data.claim_amount ? parseFloat(data.claim_amount) : undefined,
        deductible_amount: data.deductible_amount ? parseFloat(data.deductible_amount) : undefined,
      };

      await createSinistro.mutateAsync(submitData);
      
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar sinistro:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Sinistro
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Registrar Novo Sinistro
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Apólice */}
              <FormField
                control={form.control}
                name="policy_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apólice *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePolicyChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma apólice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.policy_number} - {policy.insurance_company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cliente (auto-preenchido) */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cliente será preenchido automaticamente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data da Ocorrência */}
              <FormField
                control={form.control}
                name="occurrence_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data da Ocorrência *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo do Sinistro */}
              <FormField
                control={form.control}
                name="claim_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Sinistro *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {claimTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Ocorrência *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhadamente o que aconteceu..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Local da Ocorrência */}
            <FormField
              control={form.control}
              name="location_occurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Local da Ocorrência
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Circunstâncias */}
            <FormField
              control={form.control}
              name="circumstances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circunstâncias Detalhadas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhe as circunstâncias, condições climáticas, testemunhas, etc..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Número do B.O. */}
              <FormField
                control={form.control}
                name="police_report_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do B.O.</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor Estimado */}
              <FormField
                control={form.control}
                name="claim_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Franquia */}
              <FormField
                control={form.control}
                name="deductible_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Franquia (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Prioridade */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informações da Apólice Selecionada */}
            {selectedPolicy && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2">Informações da Apólice</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-white/60">Número:</span>
                    <span className="text-white ml-2">{selectedPolicy.policy_number}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Seguradora:</span>
                    <span className="text-white ml-2">{selectedPolicy.insurance_company}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Tipo:</span>
                    <span className="text-white ml-2">{selectedPolicy.type}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Vigência:</span>
                    <span className="text-white ml-2">
                      {selectedPolicy.expiration_date && 
                        new Date(selectedPolicy.expiration_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createSinistro.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createSinistro.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createSinistro.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Registrar Sinistro
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
