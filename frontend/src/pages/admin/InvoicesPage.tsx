import { AdminLayout } from '@/components/layout/AdminLayout';
import { InvoicesManager } from '@/components/invoices/InvoicesManager';

export function InvoicesPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <InvoicesManager />
      </div>
    </AdminLayout>
  );
}
