
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Upload, CheckCircle, Eye, Download, ExternalLink } from 'lucide-react';
import { Policy } from '@/types';
import { useClients } from '@/hooks/useAppData';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface PolicyModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Policy>) => Promise<void>;
  onAtivarEAnexarPdf?: (policyId: string, file: File) => Promise<void>;
}

export function PolicyModal({ 
  policy, 
  isOpen, 
  onClose, 
  onUpdate,
  onAtivarEAnexarPdf 
}: PolicyModalProps) {
  const { clients } = useClients();
  const [activeTab, setActiveTab] = useState('detalhes');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const client = policy ? clients.find(c => c.id === policy.clientId) : null;

  useEffect(() => {
    if (isOpen && policy) {
      setActiveTab('detalhes');
      setPdfFile(null);
    }
  }, [isOpen, policy]);

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleAtivarComPdf = async () => {
    if (!policy || !pdfFile || !onAtivarEAnexarPdf) return;

    setIsUploading(true);
    try {
      await onAtivarEAnexarPdf(policy.id, pdfFile);
      setPdfFile(null);
      onClose();
    } catch (error) {
      console.error('Erro ao ativar e anexar PDF:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 🎯 **PRIORIDADE 2** - ATIVAÇÃO MANUAL SEM PDF
  const handleAtivarManualmente = async () => {
    if (!policy) return;

    try {
      await onUpdate(policy.id, { status: 'Ativa' });
      onClose();
    } catch (error) {
      console.error('Erro ao ativar apólice manualmente:', error);
    }
  };

  const handleDownloadPdf = () => {
    if (!policy?.pdfAnexado) return;

    try {
      const link = document.createElement('a');
      link.href = policy.pdfAnexado.dados;
      link.download = policy.pdfAnexado.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Orçamento': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
      'Aguardando Apólice': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
      'Ativa': 'bg-green-600/20 text-green-400 border-green-600/30',
      'Cancelada': 'bg-red-600/20 text-red-400 border-red-600/30',
      'Renovada': 'bg-purple-600/20 text-purple-400 border-purple-600/30'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants['Orçamento']}>
        {status}
      </Badge>
    );
  };

  if (!policy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            {policy.policyNumber ? `Apólice ${policy.policyNumber}` : 'Orçamento'}
            {getStatusBadge(policy.status)}
          </DialogTitle>
        </DialogHeader>

        {/* Navegação por Abas */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'detalhes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('detalhes')}
            className={activeTab === 'detalhes' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
          </Button>
          <Button
            variant={activeTab === 'anexos' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('anexos')}
            className={activeTab === 'anexos' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Upload className="w-4 h-4 mr-1" />
            Anexos & Ativação
          </Button>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'detalhes' && (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            {client && (
              <div className="bg-slate-800/30 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Cliente
                </h3>
                <Link 
                  to={`/clients/${client.id}`}
                  className="text-blue-400 hover:underline font-medium"
                >
                  {client.name}
                </Link>
                {client.email && (
                  <p className="text-sm text-slate-300 mt-1">{client.email}</p>
                )}
                {client.phone && (
                  <p className="text-sm text-slate-300">{client.phone}</p>
                )}
              </div>
            )}

            {/* Detalhes da Apólice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Seguradora</Label>
                  <p className="text-white font-medium">{policy.insuranceCompany}</p>
                </div>
                
                <div>
                  <Label className="text-slate-300">Tipo de Seguro</Label>
                  <p className="text-white font-medium">{policy.type}</p>
                </div>
                
                {policy.insuredAsset && (
                  <div>
                    <Label className="text-slate-300">Bem Segurado</Label>
                    <p className="text-white font-medium">{policy.insuredAsset}</p>
                  </div>
                )}

                {policy.bonus_class && (
                  <div>
                    <Label className="text-slate-300">Classe de Bônus</Label>
                    <p className="text-white font-medium">{policy.bonus_class}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Valor do Prêmio</Label>
                  <p className="text-white font-medium text-lg">
                    {formatCurrency(policy.premiumValue)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-slate-300">Taxa de Comissão</Label>
                  <p className="text-white font-medium">{policy.commissionRate}%</p>
                </div>
                
                <div>
                  <Label className="text-slate-300">Valor da Comissão</Label>
                  <p className="text-green-400 font-medium text-lg">
                    {formatCurrency((policy.premiumValue * policy.commissionRate) / 100)}
                  </p>
                </div>

                {policy.expirationDate && (
                  <div>
                    <Label className="text-slate-300">Data de Vencimento</Label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(policy.expirationDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status e Renovação */}
            {policy.renewalStatus && (
              <div className="bg-slate-800/30 p-4 rounded-lg">
                <Label className="text-slate-300">Status de Renovação</Label>
                <p className="text-white font-medium mt-1">{policy.renewalStatus}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'anexos' && (
          <div className="space-y-6">
            {/* PDF Anexado Existente */}
            {policy.pdfAnexado && (
              <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  PDF Anexado
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{policy.pdfAnexado.nome}</p>
                    <p className="text-sm text-slate-300">Arquivo anexado com sucesso</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="border-green-600/30 text-green-400 hover:bg-green-600/10"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            )}

            {/* 🎯 **OPÇÕES DE ATIVAÇÃO** */}
            {policy.status === 'Aguardando Apólice' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-4">Ativar Apólice</h3>
                
                {/* Opção 1: Ativar com PDF */}
                <div className="bg-slate-800/30 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-white">Ativar com Anexo de PDF</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pdf-upload" className="text-slate-300">
                        Selecionar arquivo PDF da apólice
                      </Label>
                      <Input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="border-slate-600 bg-slate-800 text-white file:bg-slate-700 file:border-0 file:text-white"
                      />
                    </div>
                    
                    {pdfFile && (
                      <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded">
                        <p className="text-blue-400 text-sm">
                          📄 {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleAtivarComPdf}
                      disabled={!pdfFile || isUploading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? 'Processando...' : 'Ativar e Anexar PDF'}
                    </Button>
                  </div>
                </div>

                {/* Opção 2: Ativar Manualmente */}
                <div className="bg-slate-800/30 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-white">Ativar Manualmente</h4>
                  <p className="text-sm text-slate-300">
                    Ative a apólice sem anexar PDF. Você pode anexar o documento posteriormente.
                  </p>
                  <Button
                    onClick={handleAtivarManualmente}
                    variant="outline"
                    className="w-full border-green-600/30 text-green-400 hover:bg-green-600/10"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ativar Apólice Manualmente
                  </Button>
                </div>
              </div>
            )}

            {/* Upload de PDF para Apólices Ativas */}
            {policy.status === 'Ativa' && !policy.pdfAnexado && (
              <div className="bg-slate-800/30 p-4 rounded-lg space-y-4">
                <h4 className="font-medium text-white">Anexar PDF da Apólice</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pdf-upload-active" className="text-slate-300">
                      Selecionar arquivo PDF
                    </Label>
                    <Input
                      id="pdf-upload-active"
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="border-slate-600 bg-slate-800 text-white file:bg-slate-700 file:border-0 file:text-white"
                    />
                  </div>
                  
                  {pdfFile && (
                    <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded">
                      <p className="text-blue-400 text-sm">
                        📄 {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleAtivarComPdf}
                    disabled={!pdfFile || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? 'Enviando...' : 'Anexar PDF'}
                  </Button>
                </div>
              </div>
            )}

            {/* Informação para outros status */}
            {policy.status !== 'Aguardando Apólice' && policy.status !== 'Ativa' && (
              <div className="bg-slate-800/30 p-4 rounded-lg text-center">
                <p className="text-slate-300">
                  Anexo de documentos disponível apenas para apólices ativas ou aguardando ativação.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
