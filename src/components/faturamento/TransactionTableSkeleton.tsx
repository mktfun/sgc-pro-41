
import { Skeleton } from '@/components/ui/skeleton';
import { AppCard } from '@/components/ui/app-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TransactionTableSkeleton() {
  return (
    <AppCard className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-b-white/10 hover:bg-white/5">
            <TableHead className="text-white">Descrição</TableHead>
            <TableHead className="text-white">Tipo</TableHead>
            <TableHead className="text-white">Data</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-right text-white">Valor</TableHead>
            <TableHead className="text-white">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index} className="border-b-white/10 hover:bg-white/5">
              <TableCell>
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-[200px] bg-white/20" />
                  <Skeleton className="h-3 w-[150px] bg-white/10" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px] bg-white/20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[90px] bg-white/20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[70px] bg-white/20 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[100px] bg-white/20 ml-auto" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-[90px] bg-white/20" />
                  <Skeleton className="h-8 w-[80px] bg-white/20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppCard>
  );
}
