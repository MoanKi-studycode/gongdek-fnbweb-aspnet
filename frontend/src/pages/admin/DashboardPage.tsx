import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  getDashboardTongQuan,
  getStockAlertLabel,
  formatRelativeTime,
  type DashboardTongQuan,
} from '@/services/reportService';
import { updateOnlineOrderStatus } from '@/services/onlineOrderService';

export function DashboardPage() {
  const [data, setData] = useState<DashboardTongQuan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const formatChartCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN').format(value / 1000) + 'K';

  // Tải dữ liệu dashboard từ API
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDashboardTongQuan();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleConfirmOrder = async (maHoaDon: number) => {
    setConfirmingId(maHoaDon);
    try {
      await updateOnlineOrderStatus(maHoaDon, 'processing');
      toast.success(`Đã xác nhận đơn #HD${String(maHoaDon).padStart(4, '0')}`);
      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xác nhận đơn.');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Không có dữ liệu'}</p>
          <Button variant="outline" onClick={loadDashboard}>
            Thử lại
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const statsData = [
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(data.doanhThuHomNay),
      change: `Tháng này: ${formatCurrency(data.doanhThuThang)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Tổng đơn hôm nay',
      value: String(data.soHoaDonHomNay),
      change: `${data.soDonTaiQuay} tại quầy, ${data.soDonOnline} online`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Khách hàng',
      value: String(data.soKhachHomNay),
      change: `${data.khachMoiHomNay} khách mới`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Đơn online chờ',
      value: String(data.donOnlineChoXacNhan),
      change: 'Cần xác nhận',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const chartData = data.doanhThu7Ngay.map((item) => ({
    day: item.nhan,
    revenue: item.doanhThu,
  }));

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng trở lại! Đây là tổng quan hôm nay.</p>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Biểu đồ doanh thu 7 ngày */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu 7 ngày</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.some((d) => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={formatChartCurrency} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                    <Line type="monotone" dataKey="revenue" stroke="#8B7355" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  Chưa có dữ liệu doanh thu
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top sản phẩm bán chạy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Top sản phẩm bán chạy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topSanPham.length > 0 ? (
                <div className="space-y-4">
                  {data.topSanPham.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#E8DCC4] rounded-full flex items-center justify-center text-sm font-bold text-[#8B7355] mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-900">{product.tenSanPham}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#8B7355]">{product.soLuong} ly</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu bán hàng hôm nay</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Đơn online chờ xác nhận */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Đơn online chờ xác nhận ({data.donOnlineCho.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.donOnlineCho.length > 0 ? (
                <div className="space-y-3">
                  {data.donOnlineCho.map((order) => (
                    <div key={order.maHoaDon} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">#HD{String(order.maHoaDon).padStart(4, '0')}</span>
                          <span className="text-sm text-gray-600 truncate">- {order.hoTen}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(order.thoiGianLap)}</p>
                      </div>
                      <p className="font-semibold text-[#8B7355] shrink-0">{formatCurrency(order.tongThanhToan)}</p>
                      <Button
                        size="sm"
                        className="shrink-0 bg-[#8B7355] hover:bg-[#6F5B44]"
                        disabled={confirmingId === order.maHoaDon}
                        onClick={() => handleConfirmOrder(order.maHoaDon)}
                      >
                        {confirmingId === order.maHoaDon ? '...' : 'Xác nhận'}
                      </Button>
                    </div>
                  ))}
                  <Link
                    to="/admin/orders-online"
                    className="block text-center text-sm text-blue-600 hover:underline mt-2"
                  >
                    Xem tất cả đơn online
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Không có đơn chờ xác nhận</p>
              )}
            </CardContent>
          </Card>

          {/* Cảnh báo nguyên liệu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Cảnh báo nguyên liệu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.nguyenLieuSapHet.length > 0 ? (
                <div className="space-y-3">
                  {data.nguyenLieuSapHet.map((item) => (
                    <div key={item.maNL} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.tenNguyenLieu}</p>
                        <p className="text-sm text-gray-600">
                          {item.soLuongTon} {item.donViTinh} (ngưỡng: {item.nguongCanhBao})
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.trangThai === 'HetHang'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {getStockAlertLabel(item.trangThai)}
                      </span>
                    </div>
                  ))}
                  <Link to="/admin/inventory">
                    <Button className="w-full mt-2 bg-[#8B7355] hover:bg-[#6F5B44]">
                      Xem kho nguyên liệu
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Tồn kho nguyên liệu ổn định</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
