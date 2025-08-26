
import { SheetsSyncDashboard } from '@/components/sheets/SheetsSyncDashboard';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SheetsSync() {
  usePageTitle('Sincronização Google Sheets');

  return (
    <div className="p-6">
      <SheetsSyncDashboard />
    </div>
  );
}
