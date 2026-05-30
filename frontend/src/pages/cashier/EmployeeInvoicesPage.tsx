import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Receipt } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { InvoicesManager } from '@/components/invoices/InvoicesManager';
import { logoutConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';

export function EmployeeInvoicesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { confirm } = useConfirm();

  if (!isAuthenticated || !user) {
    navigate('/auth/login');
    return null;
  }

  if (user.vaiTro !== 'NhanVien' && user.vaiTro !== 'QuanLy') {
    navigate('/auth/login');
    return null;
  }

  const handleLogout = async () => {
    const ok = await confirm(logoutConfirmOptions());
    if (!ok) return;
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <Link to="/employee/pos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                POS
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300 shrink-0" />
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#8B7355]" />
                Hóa đơn
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {user.hoTen || user.tenDangNhap}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/employee/orders-online">
              <Button variant="outline" size="sm">
                Đơn online
              </Button>
            </Link>
            <Link to="/employee/customers">
              <Button variant="outline" size="sm">
                Khách hàng
              </Button>
            </Link>
            <Link to="/employee/shifts">
              <Button variant="outline" size="sm">
                Ca làm
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <InvoicesManager employeeMode currentEmployeeName={user.hoTen} />
      </div>
    </div>
  );
}
