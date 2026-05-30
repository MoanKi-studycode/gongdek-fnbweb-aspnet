import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Award, Eye, LogOut, RefreshCw, Search, UserCircle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CustomerDetailDialog } from '@/components/customers/CustomerDetailDialog';
import {
  formatCustomerPrice,
  getMemberLevelColor,
} from '@/components/customers/customerUi';
import { findCustomerByPhone, getCustomers } from '@/services/customerService';
import { logoutConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError } from '@/components/common/ToastMessage';
import type { Customer } from '@/types';

export function EmployeeCustomersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { confirm } = useConfirm();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneLookup, setPhoneLookup] = useState('');
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadCustomers = useCallback(async (search?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomers(search?.trim() || undefined);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers(searchQuery);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loadCustomers, searchQuery]);

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

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handlePhoneLookup = async () => {
    const phone = phoneLookup.trim();
    if (!phone) {
      notifyError(null, 'Vui lòng nhập số điện thoại.');
      return;
    }

    setLookupLoading(true);
    try {
      const customer = await findCustomerByPhone(phone);
      if (!customer) {
        notifyError(null, 'Không tìm thấy khách hàng với số điện thoại này.');
        return;
      }
      handleViewDetail(customer);
    } catch (err) {
      notifyError(err, 'Tra cứu khách hàng thất bại.');
    } finally {
      setLookupLoading(false);
    }
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
                <UserCircle className="w-5 h-5 text-[#8B7355]" />
                Tra cứu khách hàng
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {user.hoTen || user.tenDangNhap} · Chỉ xem thông tin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/employee/invoices">
              <Button variant="outline" size="sm">
                Hóa đơn
              </Button>
            </Link>
            <Link to="/employee/orders-online">
              <Button variant="outline" size="sm">
                Đơn online
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

      <div className="p-4 md:p-8 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Tra nhanh theo số điện thoại..."
                value={phoneLookup}
                onChange={(e) => setPhoneLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handlePhoneLookup();
                  }
                }}
              />
              <Button
                type="button"
                className="bg-[#8B7355] hover:bg-[#6F5B44] shrink-0"
                disabled={lookupLoading}
                onClick={() => void handlePhoneLookup()}
              >
                {lookupLoading ? 'Đang tra...' : 'Tra cứu SĐT'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => void loadCustomers(searchQuery)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải lại
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Không tìm thấy khách hàng</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã KH</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điểm tích lũy</TableHead>
                    <TableHead>Hạng thành viên</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="text-sm text-gray-600">{customer.email || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-[#8B7355] mr-2" />
                          <span className="font-semibold text-[#8B7355]">{customer.points} điểm</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMemberLevelColor(customer.memberLevel)}>
                          {customer.memberLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCustomerPrice(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(customer)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerDetailDialog
        customer={selectedCustomer}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
