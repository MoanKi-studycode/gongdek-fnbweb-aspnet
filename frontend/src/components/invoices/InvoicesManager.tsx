import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Eye, Receipt, DollarSign, RefreshCw } from 'lucide-react';
import {
  exportInvoicePdf,
  getInvoiceById,
  getInvoices,
  type InvoiceQuery,
} from '@/services/invoiceService';
import { getOrderStatusColor, getOrderStatusLabel } from '@/services/orderStatus';
import type { Invoice } from '@/types/modules';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { notifyError, notifySuccess } from '@/components/common/ToastMessage';

type DateFilter = 'TODAY' | 'WEEK' | 'ALL';
type OrderTypeFilter = 'ALL' | 'Online' | 'TaiQuay';
type InvoiceStatusFilter =
  | 'ALL'
  | 'ChoThanhToan'
  | 'DaThanhToan'
  | 'ChoPhaChe'
  | 'HoanThanh'
  | 'DaHuy';

const INVOICE_STATUS_LABELS: Record<string, string> = {
  ChoThanhToan: 'Chờ thanh toán',
  DaThanhToan: 'Đã thanh toán',
  ChoPhaChe: 'Chờ pha chế',
  HoanThanh: 'Hoàn thành',
  DaHuy: 'Đã hủy',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  ChoThanhToan: 'bg-orange-100 text-orange-700',
  DaThanhToan: 'bg-teal-100 text-teal-700',
  ChoPhaChe: 'bg-blue-100 text-blue-700',
  HoanThanh: 'bg-green-100 text-green-700',
  DaHuy: 'bg-gray-100 text-gray-700',
};

interface InvoicesManagerProps {
  /** Chế độ nhân viên: mặc định lọc hóa đơn do mình lập */
  employeeMode?: boolean;
  currentEmployeeName?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getPaymentMethodBadge(method: string) {
  const colors: Record<string, string> = {
    'Tiền mặt': 'bg-green-100 text-green-700',
    'Chuyển khoản': 'bg-blue-100 text-blue-700',
    'Ví điện tử': 'bg-purple-100 text-purple-700',
  };
  return colors[method] || 'bg-gray-100 text-gray-700';
}

function buildDateQuery(filter: DateFilter): Pick<InvoiceQuery, 'tuNgay' | 'denNgay'> {
  if (filter === 'ALL') return {};
  const today = new Date();
  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  if (filter === 'TODAY') {
    return { tuNgay: toIso(today), denNgay: toIso(today) };
  }
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  return { tuNgay: toIso(weekAgo), denNgay: toIso(today) };
}

export function InvoicesManager({ employeeMode = false, currentEmployeeName }: InvoicesManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>(employeeMode ? 'TODAY' : 'ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('ALL');
  const [mineOnly, setMineOnly] = useState(employeeMode);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query: InvoiceQuery = {
        ...buildDateQuery(dateFilter),
        trangThai: statusFilter === 'ALL' ? undefined : statusFilter,
      };
      const data = await getInvoices(query);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (mineOnly && currentEmployeeName && inv.employeeName !== currentEmployeeName) {
        return false;
      }
      if (orderTypeFilter !== 'ALL' && inv.loaiDon !== orderTypeFilter) {
        return false;
      }
      if (!keyword) return true;
      return (
        inv.invoiceCode.toLowerCase().includes(keyword) ||
        inv.customerName.toLowerCase().includes(keyword) ||
        inv.customerPhone.includes(keyword) ||
        inv.employeeName.toLowerCase().includes(keyword)
      );
    });
  }, [invoices, searchQuery, orderTypeFilter, mineOnly, currentEmployeeName]);

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const handleViewDetail = async (invoice: Invoice) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setSelectedInvoice(invoice);
    try {
      const detail = await getInvoiceById(invoice.id);
      setSelectedInvoice(detail);
    } catch (err) {
      notifyError(err, 'Không thể tải chi tiết hóa đơn.');
    } finally {
      setDetailLoading(false);
    }
  };

  const renderStatusBadge = (invoice: Invoice) => {
    if (invoice.loaiDon === 'Online' && invoice.orderStatus) {
      return (
        <Badge className={getOrderStatusColor(invoice.orderStatus)}>
          {getOrderStatusLabel(invoice.orderStatus)}
        </Badge>
      );
    }
    const status = invoice.invoiceStatus ?? 'HoanThanh';
    return (
      <Badge className={INVOICE_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}>
        {INVOICE_STATUS_LABELS[status] ?? status}
      </Badge>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
          <p className="text-gray-600 mt-1">
            {employeeMode
              ? 'Tra cứu hóa đơn POS và đơn online, xuất PDF in cho khách'
              : 'Quản lý hóa đơn bán hàng tại quán'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-[#8B7355]" />
                <div>
                  <p className="text-sm text-gray-600">Số hóa đơn</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng giá trị</p>
                  <p className="text-2xl font-bold text-[#8B7355]">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={loadInvoices} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tải lại
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo mã HĐ, khách hàng, SĐT, nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">Hôm nay</SelectItem>
                <SelectItem value="WEEK">7 ngày qua</SelectItem>
                <SelectItem value="ALL">Tất cả</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={orderTypeFilter}
              onValueChange={(v) => setOrderTypeFilter(v as OrderTypeFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại đơn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                <SelectItem value="TaiQuay">POS / Tại quầy</SelectItem>
                <SelectItem value="Online">Đơn online</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as InvoiceStatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái HĐ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Mọi trạng thái</SelectItem>
                <SelectItem value="ChoThanhToan">Chờ thanh toán</SelectItem>
                <SelectItem value="DaThanhToan">Đã thanh toán</SelectItem>
                <SelectItem value="ChoPhaChe">Chờ pha chế</SelectItem>
                <SelectItem value="HoanThanh">Hoàn thành</SelectItem>
                <SelectItem value="DaHuy">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            {employeeMode && currentEmployeeName && (
              <Button
                type="button"
                variant={mineOnly ? 'default' : 'outline'}
                className={mineOnly ? 'bg-[#8B7355] hover:bg-[#6F5B44]' : ''}
                onClick={() => setMineOnly((v) => !v)}
              >
                {mineOnly ? 'Hóa đơn của tôi' : 'Tất cả nhân viên'}
              </Button>
            )}
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
              <p className="text-red-600 mb-2">{error}</p>
              <Button variant="outline" onClick={loadInvoices}>
                Thử lại
              </Button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có hóa đơn phù hợp bộ lọc</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-semibold">#{invoice.invoiceCode}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.loaiDon === 'Online' ? 'Online' : 'POS'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{invoice.customerName}</p>
                        {invoice.customerPhone && (
                          <p className="text-xs text-gray-500">{invoice.customerPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{invoice.employeeName}</TableCell>
                    <TableCell className="font-semibold text-[#8B7355]">
                      {formatPrice(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentMethodBadge(invoice.paymentMethod)}>
                        {invoice.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStatusBadge(invoice)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(invoice)}>
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn #{selectedInvoice?.invoiceCode}</DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Loại đơn</p>
                  <p className="font-semibold">
                    {selectedInvoice.loaiDon === 'Online' ? 'Đặt online' : 'POS tại quầy'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <div className="mt-1">{renderStatusBadge(selectedInvoice)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-semibold">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{selectedInvoice.customerPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nhân viên lập</p>
                  <p className="font-semibold">{selectedInvoice.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian</p>
                  <p className="font-semibold">{formatDateTime(selectedInvoice.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Danh sách món</h3>
                <Card>
                  <CardContent className="p-4">
                    {selectedInvoice.items.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Không có chi tiết món</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedInvoice.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between pb-3 border-b last:border-b-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                Size {item.size}
                                {item.toppings.length > 0 && ` • ${item.toppings.join(', ')}`}
                              </p>
                              {item.notes && (
                                <p className="text-sm text-gray-500 italic">Ghi chú: {item.notes}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-gray-600">x{item.quantity}</p>
                              <p className="font-semibold text-[#8B7355]">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng món:</span>
                    <span>{formatPrice(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Thành tiền:</span>
                    <span className="text-[#8B7355]">{formatPrice(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thanh toán:</span>
                    <Badge className={getPaymentMethodBadge(selectedInvoice.paymentMethod)}>
                      {selectedInvoice.paymentMethod}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Đóng
                </Button>
                <Button
                  className="bg-[#8B7355] hover:bg-[#6F5B44]"
                  onClick={async () => {
                    try {
                      await exportInvoicePdf(selectedInvoice.id);
                      notifySuccess('Xuất báo cáo thành công.');
                    } catch (err) {
                      notifyError(err, 'Xuất PDF thất bại');
                    }
                  }}
                >
                  Xuất PDF
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
