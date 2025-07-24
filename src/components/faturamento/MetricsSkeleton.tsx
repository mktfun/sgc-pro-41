
import { Skeleton } from '@/components/ui/skeleton';
import { AppCard } from '@/components/ui/app-card';

export function MetricsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <AppCard key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/10">
              <Skeleton className="w-6 h-6 bg-white/20" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-[120px] bg-white/20 mb-2" />
              <Skeleton className="h-8 w-[150px] bg-white/20" />
            </div>
          </div>
        </AppCard>
      ))}
    </>
  );
}
