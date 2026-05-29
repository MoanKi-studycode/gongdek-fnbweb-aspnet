import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts } from '@/services/productService';
import { getToppings } from '@/services/toppingService';
import { findCustomerByPhone } from '@/services/customerService';
import { findVoucherByCode, isVoucherValid } from '@/services/voucherService';
import { posCheckout } from '@/services/onlineOrderService';
import { Product, Topping } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Search, LogOut, Trash2, Edit, Plus, Minus, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const SIZE_SURCHARGE = 5000;

export function POSPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    orderItems,
    customer,
    voucher,
    paymentMethod,
    addOrderItem,
    removeOrderItem,
    clearOrder,
    setCustomer,
    setVoucher,
    setPaymentMethod,
    getSubtotal,
    getDiscount,
    getTotal,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    setCatalogLoading(true);
    setCatalogError('');
    Promise.all([getProducts(), getToppings()])
      .then(([products, toppings]) => {
        setProductList(products);
        setAvailableToppings(toppings);
      })
      .catch((err) =>
        setCatalogError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.')
      )
      .finally(() => setCatalogLoading(false));
  }, []);

  const categories = ['Tất cả', ...new Set(productList.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = productList;

    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [productList, selectedCategory, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateItemPrice = () => {
    const basePrice = customizeProduct?.price || 0;
    const sizePrice = size === 'L' ? SIZE_SURCHARGE : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return (basePrice + sizePrice + toppingsPrice) * quantity;
  };

  const handleProductClick = (product: Product) => {
    setCustomizeProduct(product);
    setSize('M');
    setSelectedToppings([]);
    setNotes('');
    setQuantity(1);
  };

  const handleToppingToggle = (topping: Topping, checked: boolean) => {
    if (checked) {
      setSelectedToppings([...selectedToppings, topping]);
    } else {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    }
  };

  const handleAddToOrder = () => {
    if (!customizeProduct) return;

    const basePrice = customizeProduct.price;
    const sizePrice = size === 'L' ? SIZE_SURCHARGE : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = basePrice + sizePrice + toppingsPrice;

    addOrderItem({
      product: customizeProduct,
      size,
      toppings: selectedToppings,
      notes,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
    });

    setCustomizeProduct(null);
    toast.success('Đã thêm vào đơn hàng');
  };

  const handleCustomerLookup = async () => {
    const foundCustomer = await findCustomerByPhone(customerPhone);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      toast.success(`Tìm thấy khách hàng: ${foundCustomer.name}`);
    } else {
      toast.error('Không tìm thấy khách hàng');
      setCustomer(null);
    }
  };

  const handleVoucherApply = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    const foundVoucher = await findVoucherByCode(voucherCode);
    if (foundVoucher && isVoucherValid(foundVoucher, getSubtotal())) {
      setVoucher(foundVoucher);
      toast.success(`Áp dụng voucher: ${foundVoucher.name}`);
    } else {
      toast.error('Mã voucher không hợp lệ hoặc đã hết hạn');
      setVoucher(null);
    }
  };

  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      toast.error('Chưa có món nào trong đơn hàng');
      return;
    }

    const paymentMap = {
      cash: 'TienMat' as const,
      transfer: 'ChuyenKhoan' as const,
      ewallet: 'ViDienTu' as const,
    };

    setCheckoutSuccess(true);
    try {
      const result = await posCheckout({
        soDienThoaiKhachHang: customerPhone || customer?.phone,
        maVoucher: voucher?.code,
        phuongThucThanhToan: paymentMap[paymentMethod],
        chiTiet: orderItems.map((item) => ({
          maSanPham: Number(item.product.id),
          tenSize: item.size,
          soLuong: item.quantity,
          ghiChu: item.notes || undefined,
          maToppings: item.toppings.map((t) => Number(t.id)),
        })),
      });
      clearOrder();
      setCustomerPhone('');
      setVoucherCode('');
      toast.success(`Thanh toán thành công! Mã hóa đơn #${result.maHoaDon}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thanh toán thất bại');
    } finally {
      setCheckoutSuccess(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const totalItemPrice = customizeProduct ? calculateItemPrice() : 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GongDek POS</h1>
              <p className="text-sm text-gray-600">
                {user?.hoTen ?? 'Nhan vien'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/employee/orders-online">
              <Button variant="outline" className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white">
                <Package className="w-4 h-4 mr-2" />
                Đơn Online
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* LEFT COLUMN - Products */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
          <div className="space-y-4 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm món..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#8B7355] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="mt-4 flex-1 overflow-y-auto">
            {catalogLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner /></div>
            ) : catalogError ? (
              <div className="text-center py-16 text-red-600">
                <p>Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                <p className="text-sm text-gray-500 mt-1">{catalogError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">Chưa có dữ liệu.</div>
            ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-[#8B7355] transition-colors text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[#8B7355] font-semibold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN - Order List */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Danh sách đơn hàng</h2>
            {orderItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearOrder}>
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {orderItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Chưa có món nào</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-xs text-gray-600">
                        Size {item.size}
                        {item.toppings.length > 0 && (
                          <> • {item.toppings.map((t) => t.name).join(', ')}</>
                        )}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 italic mt-1">Ghi chú: {item.notes}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPrice(item.unitPrice)} x {item.quantity}
                      </p>
                      <p className="text-[#8B7355] font-bold mt-1">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Payment Panel */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin</h2>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Customer Lookup */}
            <div>
              <Label>Khách hàng</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Nhập SĐT"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Button onClick={handleCustomerLookup} variant="outline">
                  Tra cứu
                </Button>
              </div>
              {customer && (
                <div className="mt-2 p-2 bg-[#FAF8F3] rounded-md text-sm">
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-gray-600">Điểm: {customer.points}</p>
                  <p className="text-gray-600">Hạng: {customer.memberLevel}</p>
                </div>
              )}
            </div>

            {/* Voucher */}
            <div>
              <Label>Voucher</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Mã voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handleVoucherApply} variant="outline">
                  Áp dụng
                </Button>
              </div>
              {voucher && (
                <div className="mt-2 p-2 bg-green-50 rounded-md text-sm text-green-700">
                  ✓ {voucher.name}
                </div>
              )}
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tổng món:</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              {voucher && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(getDiscount())}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Thành tiền:</span>
                <span className="text-[#8B7355]">{formatPrice(getTotal())}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Phương thức thanh toán</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as any)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer font-normal">
                    Tiền mặt
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="cursor-pointer font-normal">
                    Chuyển khoản
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ewallet" id="ewallet" />
                  <Label htmlFor="ewallet" className="cursor-pointer font-normal">
                    Ví điện tử
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full bg-[#8B7355] hover:bg-[#6F5B44] text-white py-6 text-lg font-bold mt-4"
            disabled={orderItems.length === 0 || checkoutSuccess}
          >
            {checkoutSuccess ? 'Đang xử lý...' : 'THANH TOÁN'}
          </Button>
        </div>
      </div>

      {/* Customize Product Modal */}
      <Dialog open={!!customizeProduct} onOpenChange={() => setCustomizeProduct(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh món uống</DialogTitle>
          </DialogHeader>

          {customizeProduct && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={customizeProduct.image}
                  alt={customizeProduct.name}
                  className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                />
                <h3 className="font-bold text-lg">{customizeProduct.name}</h3>
              </div>

              {/* Size */}
              <div>
                <Label>Chọn size</Label>
                <RadioGroup value={size} onValueChange={(val) => setSize(val as 'M' | 'L')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="size-m-pos" />
                    <Label htmlFor="size-m-pos" className="cursor-pointer">
                      Size M - {formatPrice(customizeProduct.price)}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="L" id="size-l-pos" />
                    <Label htmlFor="size-l-pos" className="cursor-pointer">
                      Size L - {formatPrice(customizeProduct.price + SIZE_SURCHARGE)} (+
                      {formatPrice(SIZE_SURCHARGE)})
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Toppings */}
              <div>
                <Label>Topping thêm</Label>
                <div className="space-y-2 mt-2">
                  {availableToppings.map((topping) => (
                    <div key={topping.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`topping-pos-${topping.id}`}
                        checked={selectedToppings.some((t) => t.id === topping.id)}
                        onCheckedChange={(checked) =>
                          handleToppingToggle(topping, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`topping-pos-${topping.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {topping.name} (+{formatPrice(topping.price)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes-pos">Ghi chú thêm</Label>
                <Textarea
                  id="notes-pos"
                  placeholder="Ví dụ: ít đá, ít ngọt..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Quantity */}
              <div>
                <Label>Số lượng</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="bg-[#FAF8F3] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng tiền:</span>
                  <span className="text-xl font-bold text-[#8B7355]">
                    {formatPrice(totalItemPrice)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAddToOrder}
                className="w-full bg-[#8B7355] hover:bg-[#6F5B44]"
              >
                Thêm vào đơn
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

