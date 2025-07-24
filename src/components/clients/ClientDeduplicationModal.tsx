
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Merge, Users, CheckCircle } from 'lucide-react';
import { Client } from '@/types';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { toast } from 'sonner';

interface DuplicateGroup {
  id: string;
  clients: Client[];
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ClientDeduplicationModalProps {
  clients: Client[];
  onDeduplicationComplete: () => void;
}

export function ClientDeduplicationModal({ clients, onDeduplicationComplete }: ClientDeduplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [primaryClient, setPrimaryClient] = useState<Client | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateClient, deleteClient } = useSupabaseClients();

  // Detectar duplicatas
  const detectDuplicates = () => {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    clients.forEach(client => {
      if (processed.has(client.id)) return;

      const duplicates = clients.filter(other => {
        if (other.id === client.id || processed.has(other.id)) return false;

        // Verificar nome similar (normalizado)
        const nameMatch = normalizeName(client.name) === normalizeName(other.name);
        
        // Verificar email exato
        const emailMatch = client.email && other.email && client.email.toLowerCase() === other.email.toLowerCase();
        
        // Verificar telefone (apenas números)
        const phoneMatch = client.phone && other.phone && normalizePhone(client.phone) === normalizePhone(other.phone);
        
        // Verificar CPF/CNPJ
        const docMatch = client.cpfCnpj && other.cpfCnpj && normalizeDocument(client.cpfCnpj) === normalizeDocument(other.cpfCnpj);

        return nameMatch || emailMatch || phoneMatch || docMatch;
      });

      if (duplicates.length > 0) {
        const allClients = [client, ...duplicates];
        allClients.forEach(c => processed.add(c.id));

        // Determinar a razão da duplicata
        let reason = '';
        let confidence: 'high' | 'medium' | 'low' = 'low';

        if (allClients.some(c => c.cpfCnpj) && allClients.filter(c => c.cpfCnpj).length > 1) {
          reason = 'Mesmo CPF/CNPJ';
          confidence = 'high';
        } else if (allClients.some(c => c.email) && allClients.filter(c => c.email).length > 1) {
          reason = 'Mesmo email';
          confidence = 'high';
        } else if (allClients.some(c => c.phone) && allClients.filter(c => c.phone).length > 1) {
          reason = 'Mesmo telefone';
          confidence = 'medium';
        } else {
          reason = 'Nome similar';
          confidence = 'low';
        }

        groups.push({
          id: `group-${groups.length}`,
          clients: allClients,
          reason,
          confidence
        });
      }
    });

    setDuplicateGroups(groups);
  };

  // Funções de normalização
  const normalizeName = (name: string): string => {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const normalizeDocument = (doc: string): string => {
    return doc.replace(/\D/g, '');
  };

  // Mesclar clientes
  const handleMergeClients = async () => {
    if (!selectedGroup || !primaryClient) return;

    setIsProcessing(true);
    try {
      const secondaryClients = selectedGroup.clients.filter(c => c.id !== primaryClient.id);
      
      // Mesclar dados do cliente principal com dados dos secundários
      const mergedData: Partial<Client> = {
        name: primaryClient.name,
        email: primaryClient.email || secondaryClients.find(c => c.email)?.email,
        phone: primaryClient.phone || secondaryClients.find(c => c.phone)?.phone,
        cpfCnpj: primaryClient.cpfCnpj || secondaryClients.find(c => c.cpfCnpj)?.cpfCnpj,
        birthDate: primaryClient.birthDate || secondaryClients.find(c => c.birthDate)?.birthDate,
        maritalStatus: primaryClient.maritalStatus || secondaryClients.find(c => c.maritalStatus)?.maritalStatus,
        profession: primaryClient.profession || secondaryClients.find(c => c.profession)?.profession,
        cep: primaryClient.cep || secondaryClients.find(c => c.cep)?.cep,
        address: primaryClient.address || secondaryClients.find(c => c.address)?.address,
        number: primaryClient.number || secondaryClients.find(c => c.number)?.number,
        complement: primaryClient.complement || secondaryClients.find(c => c.complement)?.complement,
        neighborhood: primaryClient.neighborhood || secondaryClients.find(c => c.neighborhood)?.neighborhood,
        city: primaryClient.city || secondaryClients.find(c => c.city)?.city,
        state: primaryClient.state || secondaryClients.find(c => c.state)?.state,
        observations: [
          primaryClient.observations,
          ...secondaryClients.map(c => c.observations).filter(Boolean)
        ].filter(Boolean).join('\n\n--- MESCLADO ---\n\n')
      };

      // Atualizar o cliente principal
      await updateClient(primaryClient.id, mergedData);

      // Deletar os clientes secundários
      for (const client of secondaryClients) {
        await deleteClient(client.id);
      }

      // Remover o grupo processado
      setDuplicateGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      setPrimaryClient(null);
      
      toast.success(`${secondaryClients.length + 1} clientes mesclados com sucesso!`);
      onDeduplicationComplete();
    } catch (error) {
      console.error('Erro ao mesclar clientes:', error);
      toast.error('Erro ao mesclar clientes');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      detectDuplicates();
    }
  }, [isOpen, clients]);

  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.clients.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users size={16} />
          Deduplicar ({totalDuplicates > 0 ? totalDuplicates : 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            Deduplicação de Clientes
          </DialogTitle>
        </DialogHeader>

        {duplicateGroups.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhuma duplicata encontrada
            </h3>
            <p className="text-white/60">
              Todos os clientes parecem ser únicos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedGroup ? (
              // Lista de grupos de duplicatas
              <div className="space-y-3">
                <p className="text-white/80">
                  Encontradas {duplicateGroups.length} possíveis duplicatas envolvendo {totalDuplicates} clientes:
                </p>
                {duplicateGroups.map((group) => (
                  <Card key={group.id} className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm">
                          {group.clients.length} clientes similares
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={group.confidence === 'high' ? 'destructive' : 
                                   group.confidence === 'medium' ? 'default' : 'secondary'}
                          >
                            {group.confidence === 'high' ? 'Alta' : 
                             group.confidence === 'medium' ? 'Média' : 'Baixa'} confiança
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => setSelectedGroup(group)}
                            className="gap-1"
                          >
                            <Merge size={14} />
                            Revisar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-white/60">Razão: {group.reason}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.clients.map(client => (
                            <Badge key={client.id} variant="outline" className="text-xs">
                              {client.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Interface de mesclagem
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroup(null)}
                  >
                    ← Voltar
                  </Button>
                  <h3 className="text-lg font-medium text-white">
                    Mesclar Clientes Duplicados
                  </h3>
                </div>

                <p className="text-white/80 mb-4">
                  Selecione o cliente principal que será mantido. Os dados dos outros clientes serão mesclados nele:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGroup.clients.map((client) => (
                    <Card 
                      key={client.id} 
                      className={`cursor-pointer transition-all ${
                        primaryClient?.id === client.id 
                          ? 'bg-blue-500/20 border-blue-400' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setPrimaryClient(client)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          {primaryClient?.id === client.id && <CheckCircle size={16} className="text-blue-400" />}
                          {client.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="text-white/60">
                          <strong>Email:</strong> {client.email || 'Não informado'}
                        </div>
                        <div className="text-white/60">
                          <strong>Telefone:</strong> {client.phone || 'Não informado'}
                        </div>
                        <div className="text-white/60">
                          <strong>CPF/CNPJ:</strong> {client.cpfCnpj || 'Não informado'}
                        </div>
                        <div className="text-white/60">
                          <strong>Criado em:</strong> {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {primaryClient && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedGroup(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleMergeClients}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Merge size={16} />
                      {isProcessing ? 'Mesclando...' : 'Mesclar Clientes'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
