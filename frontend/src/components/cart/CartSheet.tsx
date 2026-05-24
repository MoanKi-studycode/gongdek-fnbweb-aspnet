import { useState } from 'react';
import { Link } from 'react-router';
import { authPathWithReturn } from '@/lib/authRedirect';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Trash2, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';
import { placeOnlineOrder } from '@/services/onlineOrderService';

const PHI_GIAO_HANG = 15000;
const LOGIN_RETURN_URL = '/?cart=open';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function CartSheet() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const loginHref = authPathWithReturn('/auth/login', LOGIN_RETURN_URL);
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    diaChiGiao: '',
    ghiChuGiaoHang: '',
  });

  const resetOrderState = () => {
    setOrderPlaced(false);
    setPlacedOrderId(null);
    setError('');
    setFormData({ diaChiGiao: '', ghiChuGiaoHang: '' });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    closeCart();
    if (orderPlaced) resetOrderState();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasRole('KhachHang')) {
      setError('Tài khoản nhân viên/quản lý không được đặt hàng online.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOnlineOrder({
        diaChiGiao: formData.diaChiGiao.trim(),
        ghiChuGiaoHang: formData.ghiChuGiaoHang.trim() || undefined,
        chiTiet: cart.map((item) => ({
          maSanPham: Number(item.id),
          tenSize: item.size,
          soLuong: item.quantity,
          ghiChu: item.notes || undefined,
          maToppings: item.toppings.map((t) => Number(t.id)),
        })),
      });
      setPlacedOrderId(result.maHoaDon);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const tongMon = getCartTotal();
  const tongThanhToan = tongMon + (cart.length > 0 ? PHI_GIAO_HANG : 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2 border-b">
          <SheetTitle className="text-xl text-gray-900">Giỏ hàng</SheetTitle>
          <SheetDescription>
            {cart.length === 0 && !orderPlaced
              ? 'Chưa có món trong giỏ'
              : orderPlaced
                ? 'Đơn hàng đã được gửi'
                : `${cart.length} món`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {orderPlaced ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Đặt hàng thành công!</h2>
              <p className="text-gray-600 mb-2">
                Cảm ơn bạn, {user?.hoTen}! Đơn đang chờ xác nhận.
              </p>
              {placedOrderId != null && (
                <p className="text-gray-600 mb-4">
                  Mã đơn: <span className="font-semibold">#{placedOrderId}</span>
                </p>
              )}
              <div className="space-y-2">
                <Button
                  className="w-full bg-[#8B7355] hover:bg-[#6F5B44]"
                  onClick={() => {
                    resetOrderState();
                    closeCart();
                  }}
                >
                  Đóng
                </Button>
                <Link to="/customer/home" onClick={() => closeCart()}>
                  <Button variant="outline" className="w-full">
                    Tài khoản của tôi
                  </Button>
                </Link>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Thêm món từ thực đơn để bắt đầu đặt hàng.</p>
              <Button
                variant="outline"
                onClick={() => {
                  closeCart();
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Xem thực đơn
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">
                        Size {item.size}
                        {item.toppings.length > 0 && (
                          <> • {item.toppings.map((t) => t.name).join(', ')}</>
                        )}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 italic">Ghi chú: {item.notes}</p>
                      )}
                      <p className="text-[#8B7355] font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 shrink-0 h-8 w-8 p-0"
                      onClick={() => removeFromCart(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng món</span>
                  <span>{formatPrice(tongMon)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(PHI_GIAO_HANG)}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold text-gray-900 mb-4">
                <span>Thành tiền</span>
                <span>{formatPrice(tongThanhToan)}</span>
              </div>

              {isAuthenticated && hasRole('KhachHang') && (
                <p className="text-sm text-gray-600 mb-4 bg-[#F5F0E8] px-3 py-2 rounded-md">
                  Đặt hàng với tài khoản:{' '}
                  <span className="font-semibold text-gray-900">{user?.hoTen}</span>
                </p>
              )}

              {isAuthenticated && !hasRole('KhachHang') && (
                <div className="flex gap-2 items-start bg-amber-50 text-amber-800 px-3 py-2 rounded-md text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Tài khoản nhân viên/quản lý không được đặt hàng online.</span>
                </div>
              )}

              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Vui lòng đăng nhập tài khoản khách hàng để đặt hàng giao tận nơi.
                  </p>
                  <Button asChild className="w-full bg-[#8B7355] hover:bg-[#6F5B44]">
                    <Link to={loginHref}>Đăng nhập</Link>
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Chưa có tài khoản?{' '}
                    <Link
                      to={authPathWithReturn('/auth/register', LOGIN_RETURN_URL)}
                      className="text-[#8B7355] font-medium hover:underline"
                    >
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="diaChiGiao">Địa chỉ giao hàng *</Label>
                    <Input
                      id="diaChiGiao"
                      name="diaChiGiao"
                      required
                      value={formData.diaChiGiao}
                      onChange={handleInputChange}
                      placeholder="Số nhà, đường, quận/huyện, thành phố"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ghiChuGiaoHang">Ghi chú giao hàng</Label>
                    <Textarea
                      id="ghiChuGiaoHang"
                      name="ghiChuGiaoHang"
                      value={formData.ghiChuGiaoHang}
                      onChange={handleInputChange}
                      placeholder="Ghi chú cho shipper (tùy chọn)"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#8B7355] hover:bg-[#6F5B44]"
                    disabled={submitting || !hasRole('KhachHang')}
                  >
                    {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
