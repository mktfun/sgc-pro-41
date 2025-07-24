
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSupabaseProducers } from '@/hooks/useSupabaseProducers';
import { useSupabaseBrokerages } from '@/hooks/useSupabaseBrokerages';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AppCard } from '@/components/ui/app-card';

const producerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  brokerage_id: z.number().min(1, 'Corretora é obrigatória'),
});

type ProducerFormData = z.infer<typeof producerSchema>;

export function GestaoProdutores() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<any>(null);
  const { producers, loading, addProducer, updateProducer, deleteProducer, isAdding, isUpdating, isDeleting } = useSupabaseProducers();
  const { brokerages } = useSupabaseBrokerages();

  const form = useForm<ProducerFormData>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      brokerage_id: 0,
    },
  });

  const handleSubmit = async (data: ProducerFormData) => {
    try {
      const submitData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      };
      
      if (editingProducer) {
        await updateProducer(editingProducer.id, submitData);
      } else {
        await addProducer(submitData);
      }
      setIsDialogOpen(false);
      setEditingProducer(null);
      form.reset();
    } catch (error) {
      console.error('Error saving producer:', error);
    }
  };

  const handleEdit = (producer: any) => {
    setEditingProducer(producer);
    form.reset({
      name: producer.name || '',
      email: producer.email || '',
      phone: producer.phone || '',
      brokerage_id: producer.brokerage_id || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProducer(id);
    } catch (error) {
      console.error('Error deleting producer:', error);
    }
  };

  const handleNewProducer = () => {
    setEditingProducer(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // Helper function to get brokerage name by ID
  const getBrokerageName = (brokerageId: number) => {
    const brokerage = brokerages.find(b => b.id === brokerageId);
    return brokerage?.name || '-';
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Gestão de Produtores</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProducer} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produtor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProducer ? 'Editar Produtor' : 'Novo Produtor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome do Produtor</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Ex: João Silva"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-400 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="joao@exemplo.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-400 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="(11) 99999-9999"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="brokerage_id" className="text-slate-300">Corretora</Label>
                <Controller
                  name="brokerage_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Selecione uma corretora" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {brokerages.map((brokerage) => (
                          <SelectItem key={brokerage.id} value={brokerage.id.toString()}>
                            {brokerage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.brokerage_id && (
                  <p className="text-sm text-red-400 mt-1">
                    {form.formState.errors.brokerage_id.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAdding || isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingProducer ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-slate-400">Carregando...</div>
          </div>
        ) : producers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Nenhum produtor cadastrado ainda.</p>
            <p className="text-sm mt-1">Clique em "Adicionar Produtor" para começar.</p>
          </div>
        ) : (
          <AppCard className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Corretora</TableHead>
                  <TableHead className="text-right text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producers.map((producer) => (
                  <TableRow key={producer.id} className="border-b-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-slate-200">{producer.name}</TableCell>
                    <TableCell className="text-slate-300">{producer.email || '-'}</TableCell>
                    <TableCell className="text-slate-300">{producer.phone || '-'}</TableCell>
                    <TableCell className="text-slate-300">{getBrokerageName(producer.brokerage_id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(producer)}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Tem certeza que deseja excluir o produtor "{producer.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(producer.id)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppCard>
        )}
      </CardContent>
    </Card>
  );
}
