import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnrichmentPreview {
  id: string;
  description: string;
  current: {
    producer_id: string | null;
    ramo_id: string | null;
    company_id: string | null;
    brokerage_id: string | null;
  };
  enriched: {
    producer_id?: string;
    ramo_id?: string;
    company_id?: string;
    brokerage_id?: string;
  };
  source: string;
}

interface EnrichmentResponse {
  success: boolean;
  message: string;
  enriched: number;
  preview: EnrichmentPreview[];
}

export function EnrichOldTransactionsButton() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<EnrichmentPreview[]>([]);
  const { toast } = useToast();

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-old-transactions', {
        body: { preview: true }
      });

      if (error) throw error;

      const response = data as EnrichmentResponse;
      
      if (response.success) {
        setPreviewData(response.preview);
        setIsPreviewOpen(true);
        
        if (response.preview.length === 0) {
          toast({
            title: "Tudo certo! ✅",
            description: "Não há transações antigas para enriquecer.",
          });
        }
      } else {
        throw new Error('Erro ao buscar preview');
      }
    } catch (error) {
      console.error('Erro ao buscar preview:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o preview das transações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrich = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-old-transactions', {
        body: { preview: false }
      });

      if (error) throw error;

      const response = data as EnrichmentResponse;
      
      if (response.success) {
        toast({
          title: "Sucesso! 🎉",
          description: response.message,
        });
        setIsPreviewOpen(false);
        
        // Recarregar a página para mostrar os dados atualizados
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Erro ao enriquecer transações');
      }
    } catch (error) {
      console.error('Erro ao enriquecer transações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enriquecer as transações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePreview}
        disabled={isLoading}
        className="bg-purple-500/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/30"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Enriquecer Transações Antigas
      </Button>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Preview de Enriquecimento
            </DialogTitle>
            <DialogDescription>
              {previewData.length > 0 ? (
                <>
                  Encontramos <strong>{previewData.length} transação(ões)</strong> que podem ser enriquecidas automaticamente.
                  Revise as mudanças antes de confirmar.
                </>
              ) : (
                'Nenhuma transação encontrada para enriquecimento.'
              )}
            </DialogDescription>
          </DialogHeader>

          {previewData.length > 0 && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {previewData.map((item, index) => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">
                          {index + 1}. {item.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Fonte: {item.source}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {item.enriched.producer_id && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-500">Produtor:</span>
                          <span className="line-through text-slate-500">vazio</span>
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          <Badge className="bg-green-500/20 text-green-300">
                            será preenchido
                          </Badge>
                        </div>
                      )}

                      {item.enriched.ramo_id && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-500">Ramo:</span>
                          <span className="line-through text-slate-500">vazio</span>
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          <Badge className="bg-green-500/20 text-green-300">
                            será preenchido
                          </Badge>
                        </div>
                      )}

                      {item.enriched.company_id && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-500">Seguradora:</span>
                          <span className="line-through text-slate-500">vazio</span>
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          <Badge className="bg-green-500/20 text-green-300">
                            será preenchido
                          </Badge>
                        </div>
                      )}

                      {item.enriched.brokerage_id && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-500">Corretora:</span>
                          <span className="line-through text-slate-500">vazio</span>
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          <Badge className="bg-green-500/20 text-green-300">
                            será preenchido
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            {previewData.length > 0 && (
              <Button
                onClick={handleEnrich}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Confirmar Enriquecimento
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
