import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, FileText, Download } from 'lucide-react';
import {
  getDashboardTongQuan,
  getDoanhThu,
  getTopSanPham,
  exportRevenueExcel,
  exportRevenuePdf,
  type DoanhThuNgay,
  type DoanhThuThongKe,
  type TopSanPham,
} from '@/services/reportService';
import { toast } from 'sonner';

type ReportPeriod = 'today' | 'week' | 'month' | 'year';

function getDateRange(period: ReportPeriod): { tuNgay: string; denNgay: string } {
  const den = new Date();
  const tu = new Date();
  switch (period) {
    case 'today':
      break;
    case 'week':
      tu.setDate(tu.getDate() - 6);
      break;
    case 'month':
      tu.setDate(1);
      break;
    case 'year':
      tu.setMonth(0, 1);
      break;
  }
  return {
    tuNgay: tu.toISOString().slice(0, 10),
    denNgay: den.toISOString().slice(0, 10),
  };
}

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doanhThu, setDoanhThu] = useState<DoanhThuThongKe | null>(null);
  const [revenueChart, setRevenueChart] = useState<DoanhThuNgay[]>([]);
  const [topProducts, setTopProducts] = useState<TopSanPham[]>([]);
  const [khachMoiHomNay, setKhachMoiHomNay] = useState(0);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const range = getDateRange(period);
      const [tongQuan, thongKe, top] = await Promise.all([
        getDashboardTongQuan(),
        getDoanhThu(range),
        getTopSanPham({ ...range, limit: 5 }),
      ]);
      setDoanhThu(thongKe);
      setTopProducts(top);
      setKhachMoiHomNay(tongQuan.khachMoiHomNay);
      setRevenueChart(period === 'week' ? tongQuan.doanhThu7Ngay : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleExport = async (type: 'pdf' | 'excel') => {
    const range = getDateRange(period);
    setExporting(type);
    try {
      if (type === 'excel') {
        await exportRevenueExcel(range.tuNgay, range.denNgay);
        toast.success('Đã xuất file Excel');
      } else {
        await exportRevenuePdf(range.tuNgay, range.denNgay);
        toast.success('Đã xuất file PDF');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xuất báo cáo thất bại');
    } finally {
      setExporting(null);
    }
  };

  const chartData = revenueChart.map((item) => ({
    date: item.nhan,
    revenue: item.doanhThu,
  }));

  const avgOrderValue =
    doanhThu && doanhThu.soHoaDon > 0 ? doanhThu.tongDoanhThu / doanhThu.soHoaDon : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadReports}>
            Thử lại
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo doanh thu</h1>
            <p className="text-gray-600 mt-1">Thống kê và phân tích kinh doanh từ hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="year">Năm này</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!!exporting}
              onClick={() => handleExport('excel')}
              className="border-[#8B7355] text-[#8B7355]"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'excel' ? 'Đang xuất...' : 'Excel'}
            </Button>
            <Button
              disabled={!!exporting}
              onClick={() => handleExport('pdf')}
              className="bg-[#8B7355] hover:bg-[#6F5B44]"
            >
              <FileText className="w-4 h-4 mr-2" />
              {exporting === 'pdf' ? 'Đang xuất...' : 'PDF'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-[#8B7355] mt-1">
                    {formatPrice(doanhThu?.tongDoanhThu ?? 0)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-[#8B7355] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Số hóa đơn</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {doanhThu?.soHoaDon ?? 0}
                  </p>
                </div>
                <ShoppingCart className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Giá trị TB/đơn</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatPrice(avgOrderValue)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Khách mới hôm nay</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{khachMoiHomNay}</p>
                </div>
                <Users className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {period === 'week' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu 7 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Chưa có dữ liệu doanh thu</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value: number) => formatPrice(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#8B7355"
                      strokeWidth={2}
                      dot={{ fill: '#8B7355', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Chưa có dữ liệu sản phẩm</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.tenSanPham} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.tenSanPham}</p>
                        <p className="text-sm text-gray-600">Đã bán: {product.soLuong}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
