import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Eye, Clock, MapPin, Phone, User } from 'lucide-react';
import {
  getOnlineOrders,
  updateOnlineOrderStatus,
  cancelOnlineOrder,
  type OnlineOrder,
  type OrderStatus,
} from '@/services/onlineOrderService';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  getAllowedOnlineStatusOptions,
  getDefaultNextOnlineStatus,
  canUpdateOnlineStatus,
} from '@/services/orderStatus';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

export function OrdersOnlinePage() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CHO_XAC_NHAN');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getOnlineOrders()
      .then(setOrders)
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

  const getFilteredOrders = () => {
    if (selectedStatus === 'ALL') return orders;
    return orders.filter((order) => order.status === selectedStatus);
  };

  const getOrderCount = (status: OrderStatus | 'ALL') => {
    if (status === 'ALL') return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const handleViewDetail = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setNewStatus(getDefaultNextOnlineStatus(order.status));
    setCancelReason('');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    if (newStatus === 'DA_HUY' && !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      if (newStatus === 'DA_HUY') {
        await cancelOnlineOrder(selectedOrder.id, cancelReason);
      } else {
        await updateOnlineOrderStatus(selectedOrder.id, newStatus);
      }
      setOrders(await getOnlineOrders());
      toast.success(`Cập nhật trạng thái thành công: ${getOrderStatusLabel(newStatus)}`);
      setIsDetailOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn online</h1>
          <p className="text-gray-600 mt-1">Quản lý đơn hàng đặt online</p>
        </div>

        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="ALL">
              Tất cả ({getOrderCount('ALL')})
            </TabsTrigger>
            <TabsTrigger value="CHO_XAC_NHAN">
              Chờ xác nhận ({getOrderCount('CHO_XAC_NHAN')})
            </TabsTrigger>
            <TabsTrigger value="DANG_XU_LY">
              Đang xử lý ({getOrderCount('DANG_XU_LY')})
            </TabsTrigger>
            <TabsTrigger value="DANG_GIAO">
              Đang giao ({getOrderCount('DANG_GIAO')})
            </TabsTrigger>
            <TabsTrigger value="HOAN_THANH">
              Hoàn thành ({getOrderCount('HOAN_THANH')})
            </TabsTrigger>
            <TabsTrigger value="DA_HUY">
              Đã hủy ({getOrderCount('DA_HUY')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12"><LoadingSpinner /></div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Chưa có dữ liệu.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>SĐT</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-semibold">
                            #{order.orderCode}
                          </TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.customerPhone}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {order.deliveryAddress}
                          </TableCell>
                          <TableCell className="font-semibold text-[#8B7355]">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getOrderStatusColor(order.status)}>
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
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
          </TabsContent>
        </Tabs>

        {/* Order Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.orderCode}</DialogTitle>
              <DialogDescription>
                Đặt lúc: {selectedOrder && formatDateTime(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Khách hàng</p>
                            <p className="font-semibold">{selectedOrder.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Số điện thoại</p>
                            <p className="font-semibold">{selectedOrder.customerPhone}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                          <p className="font-semibold">{selectedOrder.deliveryAddress}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Danh sách món</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between pb-3 border-b last:border-b-0">
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
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Tổng kết đơn hàng</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Tổng món:</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm giá:</span>
                            <span>-{formatPrice(selectedOrder.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>Phí giao hàng:</span>
                          <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Thành tiền:</span>
                          <span className="text-[#8B7355]">{formatPrice(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Phương thức thanh toán:</span>
                          <span>{selectedOrder.paymentMethod}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Update Status */}
                {selectedOrder && canUpdateOnlineStatus(selectedOrder.status) ? (
                <div>
                  <h3 className="font-semibold mb-3">Cập nhật trạng thái</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Trạng thái đơn hàng</Label>
                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllowedOnlineStatusOptions(selectedOrder.status).map((status) => (
                            <SelectItem key={status} value={status}>
                              {getOrderStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newStatus === 'DA_HUY' && (
                      <div className="space-y-2">
                        <Label>Lý do hủy *</Label>
                        <Textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Nhập lý do hủy đơn hàng..."
                          rows={3}
                        />
                      </div>
                    )}

                    {selectedOrder.notes && (
                      <div className="p-3 bg-yellow-50 rounded-md">
                        <p className="text-sm font-semibold text-yellow-800">Ghi chú:</p>
                        <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    Đơn đã hoàn thành hoặc đã hủy — không thể cập nhật trạng thái.
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>
                  {selectedOrder && canUpdateOnlineStatus(selectedOrder.status) && (
                  <Button
                    onClick={handleUpdateStatus}
                    className="bg-[#8B7355] hover:bg-[#6F5B44]"
                  >
                    Cập nhật trạng thái
                  </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

