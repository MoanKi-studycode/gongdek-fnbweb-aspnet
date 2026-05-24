import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, ShoppingBag, User } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices, type Invoice } from '@/services/orderService';

export function CustomerAccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // TODO [Nguyễn Hoài Phương]: lấy điểm tích lũy, hạng thành viên từ API khách hàng
  useEffect(() => {
    getInvoices().then(setInvoices);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (!user) return null;

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
              <p className="font-semibold text-gray-900">{user.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mã khách hàng</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Bạn chưa có đơn hàng nào</p>
                <Link to="/">
                  <Button className="mt-4 bg-[#8B7355] hover:bg-[#6F5B44]">Đặt hàng ngay</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono font-semibold text-[#8B7355]">#{invoice.invoiceCode}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">{formatPrice(invoice.total)}</p>
                    </div>
                    <Separator className="my-2" />
                    {invoice.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {item.quantity}x {item.productName} ({item.size})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


