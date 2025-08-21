import { useState } from 'react';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Eye
} from 'lucide-react';

// Mock data para demonstração
const mockSinistros = [
  {
    id: '2024-001',
    protocolo: 'SIN-2024-001',
    cliente: 'João Silva',
    apolice: 'AP-2024-001',
    tipo: 'Colisão',
    status: 'Em Análise',
    dataOcorrencia: '2024-01-15',
    valor: 15000,
    descricao: 'Colisão traseira no estacionamento'
  },
  {
    id: '2024-002',
    protocolo: 'SIN-2024-002',
    cliente: 'Maria Santos',
    apolice: 'AP-2024-002',
    tipo: 'Roubo',
    status: 'Aprovado',
    dataOcorrencia: '2024-01-10',
    valor: 45000,
    descricao: 'Veículo roubado na Av. Paulista'
  },
  {
    id: '2024-003',
    protocolo: 'SIN-2024-003',
    cliente: 'Pedro Costa',
    apolice: 'AP-2024-003',
    tipo: 'Incêndio',
    status: 'Negado',
    dataOcorrencia: '2024-01-08',
    valor: 80000,
    descricao: 'Incêndio em residência'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Aberto':
      return 'bg-blue-500';
    case 'Em Análise':
      return 'bg-yellow-500';
    case 'Aprovado':
      return 'bg-green-500';
    case 'Negado':
      return 'bg-red-500';
    case 'Finalizado':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Aberto':
      return <AlertTriangle className="w-4 h-4" />;
    case 'Em Análise':
      return <Clock className="w-4 h-4" />;
    case 'Aprovado':
      return <CheckCircle className="w-4 h-4" />;
    case 'Negado':
      return <XCircle className="w-4 h-4" />;
    case 'Finalizado':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function Sinistros() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const filteredSinistros = mockSinistros.filter(sinistro => {
    const matchesSearch = sinistro.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sinistro.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sinistro.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'Todos' || sinistro.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Sinistros
          </h1>
          <p className="text-white/60">Gerencie ocorrências e processos de sinistro</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Sinistro
        </Button>
      </div>

      {/* Filtros */}
      <AppCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por cliente, protocolo ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['Todos', 'Aberto', 'Em Análise', 'Aprovado', 'Negado', 'Finalizado'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </AppCard>

      {/* Lista de Sinistros */}
      <div className="grid gap-4">
        {filteredSinistros.map((sinistro) => (
          <AppCard key={sinistro.id} className="hover:bg-white/5 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{sinistro.protocolo}</h3>
                  <Badge className={`${getStatusColor(sinistro.status)} text-white flex items-center gap-1`}>
                    {getStatusIcon(sinistro.status)}
                    {sinistro.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Cliente:</span>
                    <p className="text-white font-medium">{sinistro.cliente}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Apólice:</span>
                    <p className="text-white font-medium">{sinistro.apolice}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Tipo:</span>
                    <p className="text-white font-medium">{sinistro.tipo}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Data:</span>
                    <p className="text-white font-medium">
                      {new Date(sinistro.dataOcorrencia).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-white/60 text-sm">Descrição:</span>
                  <p className="text-white/80 text-sm">{sinistro.descricao}</p>
                </div>
                
                {sinistro.valor && (
                  <div className="mt-2">
                    <span className="text-white/60 text-sm">Valor estimado:</span>
                    <p className="text-white font-semibold">
                      {sinistro.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Documentos
                </Button>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Estado vazio */}
      {filteredSinistros.length === 0 && (
        <AppCard className="text-center py-12">
          <ShieldAlert className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhum sinistro encontrado
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || selectedStatus !== 'Todos'
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Registre o primeiro sinistro para começar o gerenciamento.'}
          </p>
          {(!searchTerm && selectedStatus === 'Todos') && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeiro Sinistro
            </Button>
          )}
        </AppCard>
      )}
    </div>
  );
}
