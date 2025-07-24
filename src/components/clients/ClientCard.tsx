
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { Client } from '@/types';
import { generateWhatsAppUrl } from '@/utils/whatsapp';
import { useNavigate } from 'react-router-dom';

interface ClientCardProps {
  client: Client;
  activePoliciesCount: number;
}

export function ClientCard({ client, activePoliciesCount }: ClientCardProps) {
  const navigate = useNavigate();

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Olá ${client.name}! Como posso ajudá-lo hoje?`;
    const url = generateWhatsAppUrl(client.phone, message);
    window.open(url, '_blank');
  };

  const handleCardClick = () => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <GlassCard 
      className="p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
          <User size={20} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{client.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/10">
              {activePoliciesCount} {activePoliciesCount === 1 ? 'seguro' : 'seguros'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center">
            <span className="font-medium w-16 text-white/80">Phone:</span>
            <span>{client.phone}</span>
          </div>
          <button
            onClick={handleWhatsAppClick}
            className="text-green-400 hover:text-green-300 transition-colors p-1"
            title="Enviar WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>
        <div className="flex items-center text-sm text-white/60">
          <span className="font-medium w-16 text-white/80">Email:</span>
          <span className="truncate">{client.email}</span>
        </div>
      </div>
    </GlassCard>
  );
}
