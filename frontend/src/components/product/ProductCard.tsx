import { useState, useMemo, useEffect } from 'react';
import { Product, Topping } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { ProductReviewBadge } from '@/components/reviews/ProductReviewBadge';
import { ProductReviewsDialog } from '@/components/reviews/ProductReviewsDialog';
import type { ProductReviewSummary } from '@/types/modules';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getToppings } from '@/services/toppingService';

interface ProductCardProps {
  product: Product;
  reviewSummary?: ProductReviewSummary | null;
}

const SIZE_SURCHARGE = 5000; // Phụ thu Size L

export function ProductCard({ product, reviewSummary }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([]);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  useEffect(() => {
    getToppings().then(setAvailableToppings);
  }, []);

  // Calculate total price realtime
  const totalPrice = useMemo(() => {
    const basePrice = product.price;
    const sizePrice = size === 'L' ? SIZE_SURCHARGE : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return (basePrice + sizePrice + toppingsPrice) * quantity;
  }, [product.price, size, selectedToppings, quantity]);

  const handleToppingToggle = (topping: Topping, checked: boolean) => {
    if (checked) {
      setSelectedToppings([...selectedToppings, topping]);
    } else {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    }
  };

  const handleAddToCart = () => {
    addToCart(product, size, selectedToppings, notes, quantity);
    setIsOpen(false);
    // Reset to defaults
    setSize('M');
    setSelectedToppings([]);
    setNotes('');
    setQuantity(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
            <span className="text-[#8B7355] font-semibold">{formatPrice(product.price)}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
          <div className="mb-4">
            <ProductReviewBadge
              summary={reviewSummary}
              onClick={() => setReviewsOpen(true)}
            />
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-[#8B7355] hover:bg-[#6F5B44]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm vào đơn
          </Button>
        </div>
      </div>

      <ProductReviewsDialog
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
        productId={product.id}
        productName={product.name}
        initialSummary={reviewSummary}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh món</DialogTitle>
            <DialogDescription>{product.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Size Selection */}
            <div className="space-y-3">
              <Label>Chọn size</Label>
              <RadioGroup value={size} onValueChange={(val) => setSize(val as 'M' | 'L')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="size-m" />
                  <Label htmlFor="size-m" className="cursor-pointer">
                    Size M - {formatPrice(product.price)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="L" id="size-l" />
                  <Label htmlFor="size-l" className="cursor-pointer">
                    Size L - {formatPrice(product.price + SIZE_SURCHARGE)} (+{formatPrice(SIZE_SURCHARGE)})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Topping Selection */}
            <div className="space-y-3">
              <Label>Topping thêm (có thể chọn nhiều)</Label>
              <div className="space-y-2">
                {availableToppings.map((topping) => (
                  <div key={topping.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topping-${topping.id}`}
                      checked={selectedToppings.some((t) => t.id === topping.id)}
                      onCheckedChange={(checked) => handleToppingToggle(topping, checked as boolean)}
                    />
                    <Label htmlFor={`topping-${topping.id}`} className="cursor-pointer font-normal">
                      {topping.name} (+{formatPrice(topping.price)})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Textarea
                id="notes"
                placeholder="Ví dụ: ít đá, ít ngọt, không đá..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label>Số lượng</Label>
              <div className="flex items-center gap-3">
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

            {/* Total Price */}
            <div className="bg-[#FAF8F3] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Tổng tiền:</span>
                <span className="text-xl font-bold text-[#8B7355]">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleAddToCart} className="w-full bg-[#8B7355] hover:bg-[#6F5B44]">
            Thêm vào đơn
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}