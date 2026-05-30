import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings,
  Warehouse,
  Building2,
  TruckIcon,
  Users,
  UserCircle,
  Ticket,
  Receipt,
  ShoppingCart,
  BarChart3,
  Clock,
  LogOut,
} from 'lucide-react';
import { logoutConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/admin/products', icon: Package, label: 'Quản lý sản phẩm' },
  { path: '/admin/categories', icon: FolderTree, label: 'Quản lý danh mục' },
  { path: '/admin/size-topping', icon: Settings, label: 'Size & Topping' },
  { path: '/admin/inventory', icon: Warehouse, label: 'Quản lý kho' },
  { path: '/admin/suppliers', icon: Building2, label: 'Quản lý nhà cung cấp' },
  { path: '/admin/stock-in', icon: TruckIcon, label: 'Quản lý nhập kho' },
  { path: '/admin/employees', icon: Users, label: 'Quản lý nhân viên' },
  { path: '/admin/shifts', icon: Clock, label: 'Quản lý ca làm việc' },
  { path: '/admin/customers', icon: UserCircle, label: 'Quản lý khách hàng' },
  { path: '/admin/vouchers', icon: Ticket, label: 'Quản lý voucher' },
  { path: '/admin/invoices', icon: Receipt, label: 'Quản lý hóa đơn' },
  { path: '/admin/orders-online', icon: ShoppingCart, label: 'Quản lý đơn online' },
  { path: '/admin/reports', icon: BarChart3, label: 'Báo cáo doanh thu' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm(logoutConfirmOptions());
    if (!ok) return;
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <BrandLogo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">GongDek</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#8B7355] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserCircle className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.hoTen ?? '—'}</p>
                <p className="text-xs text-gray-500">Quản lý</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

