import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Eye, Receipt, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { getInvoices, getInvoiceById, exportInvoicePdf } from '@/services/invoiceService';
import type { Invoice } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    getInvoices()
      .then(setInvoices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      'Tiền mặt': 'bg-green-100 text-green-700',
      'Chuyển khoản': 'bg-blue-100 text-blue-700',
      'Ví điện tử': 'bg-purple-100 text-purple-700',
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery)
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalInvoices = invoices.length;

  const handleViewDetail = async (invoice: Invoice) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setSelectedInvoice(invoice);
    try {
      const detail = await getInvoiceById(invoice.id);
      setSelectedInvoice(detail);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải chi tiết hóa đơn.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
            <p className="text-gray-600 mt-1">Quản lý hóa đơn bán hàng tại quán</p>
          </div>
          <div className="flex gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-[#8B7355]" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                    <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-[#8B7355]">
                      {formatPrice(totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn, tên khách hàng hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p>Chưa có dữ liệu.</p></div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-semibold">
                      #{invoice.invoiceCode}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell className="text-gray-600">
                      {invoice.customerPhone || '-'}
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
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(invoice)}
                      >
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

        {/* Invoice Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết hóa đơn #{selectedInvoice?.invoiceCode}</DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="font-semibold">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">
                      {selectedInvoice.customerPhone || 'Không có'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nhân viên</p>
                    <p className="font-semibold">{selectedInvoice.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="font-semibold">
                      {formatDateTime(selectedInvoice.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Danh sách món</h3>
                  <Card>
                    <CardContent className="p-4">
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
                                <p className="text-sm text-gray-500 italic">
                                  Ghi chú: {item.notes}
                                </p>
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
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
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
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Thành tiền:</span>
                        <span className="text-[#8B7355]">
                          {formatPrice(selectedInvoice.total)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thanh toán:</span>
                        <Badge className={getPaymentMethodBadge(selectedInvoice.paymentMethod)}>
                          {selectedInvoice.paymentMethod}
                        </Badge>
                      </div>
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
                        toast.success('Đã tải file PDF hóa đơn');
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Xuất PDF thất bại');
                      }
                    }}
                  >
                    Xuất PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

