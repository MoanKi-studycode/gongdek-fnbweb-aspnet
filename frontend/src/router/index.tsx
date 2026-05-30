import { createBrowserRouter, Navigate } from 'react-router';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RoleGuard } from './RoleGuard';

import { HomePage } from '@/pages/public/Home';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ProductsPage } from '@/pages/admin/ProductsPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { SizeToppingPage } from '@/pages/admin/SizeToppingPage';
import { InventoryPage } from '@/pages/admin/InventoryPage';
import { SuppliersPage } from '@/pages/admin/SuppliersPage';
import { StockInPage } from '@/pages/admin/StockInPage';
import { EmployeesPage } from '@/pages/admin/EmployeesPage';
import { ShiftsPage } from '@/pages/admin/ShiftsPage';
import { CustomersPage } from '@/pages/admin/CustomersPage';
import { VouchersPage } from '@/pages/admin/VouchersPage';
import { InvoicesPage } from '@/pages/admin/InvoicesPage';
import { OrdersOnlinePage } from '@/pages/admin/OrdersOnlinePage';
import { ReportsPage } from '@/pages/admin/ReportsPage';

import { POSPage } from '@/pages/cashier/POSPage';
import { POSOrdersOnlinePage } from '@/pages/cashier/POSOrdersOnlinePage';
import { EmployeeInvoicesPage } from '@/pages/cashier/EmployeeInvoicesPage';
import { CustomerAccountPage } from '@/pages/customer/CustomerAccountPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['QuanLy']}>{children}</RoleGuard>;
}

function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['NhanVien', 'QuanLy']}>{children}</RoleGuard>;
}

function CustomerRoute({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['KhachHang']}>{children}</RoleGuard>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'checkout', element: <Navigate to={{ pathname: '/', search: '?cart=open' }} replace /> },
    ],
  },

  { path: '/auth/login', Component: LoginPage },
  { path: '/auth/register', Component: RegisterPage },
  { path: '/auth/customer/register', element: <Navigate to="/auth/register" replace /> },
  { path: '/auth/admin/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/auth/cashier/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/auth/customer/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/pos/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/cashier', element: <Navigate to="/employee/pos" replace /> },
  { path: '/cashier/*', element: <Navigate to="/employee/pos" replace /> },
  { path: '/pos', element: <Navigate to="/employee/pos" replace /> },
  { path: '/barista', element: <Navigate to="/employee/orders-online" replace /> },
  { path: '/barista/*', element: <Navigate to="/employee/orders-online" replace /> },

  {
    path: '/employee/pos',
    element: (
      <EmployeeRoute>
        <POSPage />
      </EmployeeRoute>
    ),
  },
  {
    path: '/employee/orders-online',
    element: (
      <EmployeeRoute>
        <POSOrdersOnlinePage />
      </EmployeeRoute>
    ),
  },
  {
    path: '/employee/shifts',
    element: (
      <EmployeeRoute>
        <ShiftsPage employeeMode />
      </EmployeeRoute>
    ),
  },
  {
    path: '/employee/invoices',
    element: (
      <EmployeeRoute>
        <EmployeeInvoicesPage />
      </EmployeeRoute>
    ),
  },

  {
    path: '/customer/home',
    element: (
      <CustomerRoute>
        <CustomerAccountPage />
      </CustomerRoute>
    ),
  },
  {
    path: '/customer/account',
    element: <Navigate to="/customer/home" replace />,
  },

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <DashboardPage />
      </AdminRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminRoute>
        <DashboardPage />
      </AdminRoute>
    ),
  },
  { path: '/admin/products', element: <AdminRoute><ProductsPage /></AdminRoute> },
  { path: '/admin/categories', element: <AdminRoute><CategoriesPage /></AdminRoute> },
  { path: '/admin/size-topping', element: <AdminRoute><SizeToppingPage /></AdminRoute> },
  { path: '/admin/inventory', element: <AdminRoute><InventoryPage /></AdminRoute> },
  { path: '/admin/suppliers', element: <AdminRoute><SuppliersPage /></AdminRoute> },
  { path: '/admin/stock-in', element: <AdminRoute><StockInPage /></AdminRoute> },
  { path: '/admin/employees', element: <AdminRoute><EmployeesPage /></AdminRoute> },
  { path: '/admin/shifts', element: <AdminRoute><ShiftsPage /></AdminRoute> },
  { path: '/admin/customers', element: <AdminRoute><CustomersPage /></AdminRoute> },
  { path: '/admin/vouchers', element: <AdminRoute><VouchersPage /></AdminRoute> },
  { path: '/admin/invoices', element: <AdminRoute><InvoicesPage /></AdminRoute> },
  { path: '/admin/orders-online', element: <AdminRoute><OrdersOnlinePage /></AdminRoute> },
  { path: '/admin/reports', element: <AdminRoute><ReportsPage /></AdminRoute> },
]);
