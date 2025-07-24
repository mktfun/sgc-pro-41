
import { Client } from '@/types';
import { ClientCard } from './ClientCard';

interface ClientCardViewProps {
  clients: Client[];
  getActivePoliciesCount: (clientId: string) => number;
}

export function ClientCardView({ clients, getActivePoliciesCount }: ClientCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map(client => (
        <ClientCard
          key={client.id}
          client={client}
          activePoliciesCount={getActivePoliciesCount(client.id)}
        />
      ))}
    </div>
  );
}
