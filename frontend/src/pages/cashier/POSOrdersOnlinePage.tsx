import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
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
import { Eye, ArrowLeft, MapPin, Phone, User, LogOut } from 'lucide-react';
import {
  getOnlineOrders,
  getOrderStatusLabel,
  getOrderStatusColor,
  type OnlineOrder,
  type OrderStatus,
} from '@/services/onlineOrderService';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

export function POSOrdersOnlinePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getOnlineOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.'))
      .finally(() => setLoading(false));
  }, []);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('CHO_XAC_NHAN');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CHO_XAC_NHAN');
  const [cancelReason, setCancelReason] = useState('');

  // Kiểm tra đăng nhập nhân viên
  if (!isAuthenticated || !user) {
    navigate('/auth/login');
    return null;
  }

  if (user.vaiTro !== 'NhanVien' && user.vaiTro !== 'QuanLy') {
    navigate('/auth/login');
    return null;
  }

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
    setNewStatus(order.status);
    setCancelReason('');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;

    if (newStatus === 'DA_HUY' && !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    setOrders(
      orders.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: newStatus,
              notes: newStatus === 'DA_HUY' ? cancelReason : order.notes,
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );

    toast.success(`Cập nhật trạng thái thành công: ${getOrderStatusLabel(newStatus)}`);
    setIsDetailOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/employee/pos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại POS
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <BrandLogo size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đơn hàng Online</h1>
              <p className="text-sm text-gray-600">
                Nhân viên: {user.hoTen || user.tenDangNhap}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <TabsList className="mb-6">
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
            <TabsTrigger value="ALL">
              Tất cả ({getOrderCount('ALL')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            <Card>
              <CardContent className="p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Không có đơn hàng nào</p>
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
                          <SelectItem value="CHO_XAC_NHAN">Chờ xác nhận</SelectItem>
                          <SelectItem value="DANG_XU_LY">Đang xử lý</SelectItem>
                          <SelectItem value="DANG_GIAO">Đang giao</SelectItem>
                          <SelectItem value="HOAN_THANH">Hoàn thành</SelectItem>
                          <SelectItem value="DA_HUY">Đã hủy</SelectItem>
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

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className="bg-[#8B7355] hover:bg-[#6F5B44]"
                    disabled={newStatus === selectedOrder.status}
                  >
                    Cập nhật trạng thái
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

