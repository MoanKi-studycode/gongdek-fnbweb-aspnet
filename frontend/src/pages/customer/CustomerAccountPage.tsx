import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, ShoppingBag, User, Award } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { logoutConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { getErrorMessage } from '@/components/common/ToastMessage';
import { useAuth } from '@/contexts/AuthContext';
import { getMyInvoices, getMyProfile } from '@/services/customerService';
import {
  getCustomerOrderStatus,
  isOrderCompleted,
  isOrderInProgress,
} from '@/services/orderStatus';
import type { Customer } from '@/types';
import type { Invoice } from '@/types/modules';

type OrderFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

export function CustomerAccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const [profile, setProfile] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getMyProfile(), getMyInvoices(20)])
      .then(([p, list]) => {
        setProfile(p);
        setInvoices(list);
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'Không thể tải thông tin tài khoản.')),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    const ok = await confirm(logoutConfirmOptions());
    if (!ok) return;
    await logout();
    navigate('/auth/login');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const memberLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Bạc': 'bg-gray-100 text-gray-700',
      'Vàng': 'bg-yellow-100 text-yellow-700',
      'Kim cương': 'bg-blue-100 text-blue-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const display = profile ?? {
    name: user.hoTen,
    phone: '',
    points: 0,
    totalSpent: 0,
    memberLevel: 'Bạc' as const,
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (orderFilter === 'IN_PROGRESS') return isOrderInProgress(invoice);
    if (orderFilter === 'COMPLETED') return isOrderCompleted(invoice);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BrandLogo size="sm" />
            <span className="text-xl font-semibold text-gray-900">GongDek</span>
          </Link>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xin chào, {user.hoTen}!</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại với GongDek Tea & Coffee</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-[#FAF8F3]">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Điểm tích lũy</p>
                <p className="text-3xl font-bold text-[#8B7355] mt-1">{display.points}</p>
              </div>
              <Award className="w-10 h-10 text-[#8B7355] opacity-60" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(display.totalSpent)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-[#8B7355]" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{user.email ?? profile?.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-semibold text-gray-900">{display.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hạng thành viên</p>
              <Badge className={memberLevelColor(display.memberLevel)}>{display.memberLevel}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {([
                  ['ALL', 'Tất cả'],
                  ['IN_PROGRESS', 'Đang xử lý / giao'],
                  ['COMPLETED', 'Hoàn thành'],
                ] as [OrderFilter, string][]).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={orderFilter === key ? 'default' : 'outline'}
                    className={orderFilter === key ? 'bg-[#8B7355] hover:bg-[#6F5B44]' : ''}
                    onClick={() => setOrderFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Bạn chưa có đơn hàng nào</p>
                <Link to="/">
                  <Button className="mt-4 bg-[#8B7355] hover:bg-[#6F5B44]">Đặt hàng ngay</Button>
                </Link>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Không có đơn hàng phù hợp bộ lọc đã chọn</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.slice(0, 20).map((invoice) => {
                  const status = getCustomerOrderStatus(invoice);
                  return (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-mono font-semibold text-[#8B7355]">#{invoice.invoiceCode}</p>
                          <Badge className={status.color}>{status.label}</Badge>
                          {invoice.loaiDon && (
                            <span className="text-xs text-gray-500">
                              {invoice.loaiDon === 'Online' ? 'Đặt online' : 'Tại quầy'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 shrink-0">{formatPrice(invoice.total)}</p>
                    </div>
                    {invoice.items.length > 0 && (
                      <>
                        <Separator className="my-2" />
                        {invoice.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {item.quantity}x {item.productName} ({item.size})
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
