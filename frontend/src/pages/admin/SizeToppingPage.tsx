import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ModuleNotice } from '@/components/common/ModuleNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getToppings } from '@/services/toppingService';
import type { Topping } from '@/types';
import { toast } from 'sonner';

interface Size {
  id: string;
  name: string;
  surcharge: number;
}

const initialSizes: Size[] = [
  { id: '1', name: 'M', surcharge: 0 },
  { id: '2', name: 'L', surcharge: 5000 },
];

export function SizeToppingPage() {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const [isToppingDialogOpen, setIsToppingDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [editingTopping, setEditingTopping] = useState<any>(null);
  const [sizeFormData, setSizeFormData] = useState({ name: '', surcharge: '' });
  const [toppingFormData, setToppingFormData] = useState({
    name: '',
    price: '',
    status: 'Còn hàng',
  });

  useEffect(() => {
    getToppings().then(setToppings);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Size handlers
  const handleOpenSizeDialog = (size?: Size) => {
    if (size) {
      setEditingSize(size);
      setSizeFormData({ name: size.name, surcharge: size.surcharge.toString() });
    } else {
      setEditingSize(null);
      setSizeFormData({ name: '', surcharge: '' });
    }
    setIsSizeDialogOpen(true);
  };

  const handleSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSize) {
      setSizes(
        sizes.map((s) =>
          s.id === editingSize.id
            ? {
                ...s,
                name: sizeFormData.name,
                surcharge: parseFloat(sizeFormData.surcharge),
              }
            : s
        )
      );
      toast.success('Cập nhật size thành công!');
    } else {
      const newSize: Size = {
        id: (sizes.length + 1).toString(),
        name: sizeFormData.name,
        surcharge: parseFloat(sizeFormData.surcharge),
      };
      setSizes([...sizes, newSize]);
      toast.success('Thêm size thành công!');
    }

    setIsSizeDialogOpen(false);
  };

  // Topping handlers
  const handleOpenToppingDialog = (topping?: any) => {
    if (topping) {
      setEditingTopping(topping);
      setToppingFormData({
        name: topping.name,
        price: topping.price.toString(),
        status: 'Còn hàng',
      });
    } else {
      setEditingTopping(null);
      setToppingFormData({ name: '', price: '', status: 'Còn hàng' });
    }
    setIsToppingDialogOpen(true);
  };

  const handleToppingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTopping) {
      setToppings(
        toppings.map((t) =>
          t.id === editingTopping.id
            ? {
                ...t,
                name: toppingFormData.name,
                price: parseFloat(toppingFormData.price),
              }
            : t
        )
      );
      toast.success('Cập nhật topping thành công!');
    } else {
      const newTopping = {
        id: (toppings.length + 1).toString(),
        name: toppingFormData.name,
        price: parseFloat(toppingFormData.price),
      };
      setToppings([...toppings, newTopping]);
      toast.success('Thêm topping thành công!');
    }

    setIsToppingDialogOpen(false);
  };

  const handleDeleteTopping = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa topping này?')) {
      setToppings(toppings.filter((t) => t.id !== id));
      toast.success('Xóa topping thành công!');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Size & Topping</h1>
          <p className="text-gray-600 mt-1">Quản lý size và topping sản phẩm</p>
        </div>

        <ModuleNotice owner="Trần Quốc Tiên" module="quản lý size & topping" />

        <Tabs defaultValue="size" className="space-y-6">
          <TabsList>
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="topping">Topping</TabsTrigger>
          </TabsList>

          {/* Size Tab */}
          <TabsContent value="size">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Lưu ý: Size M là size mặc định (không phụ thu). Size L sẽ có phụ thu thêm.
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên size</TableHead>
                      <TableHead>Phụ thu</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizes.map((size) => (
                      <TableRow key={size.id}>
                        <TableCell className="font-medium">Size {size.name}</TableCell>
                        <TableCell>
                          {size.surcharge === 0 ? (
                            <span className="text-gray-500">Không phụ thu</span>
                          ) : (
                            <span className="text-[#8B7355] font-semibold">
                              +{formatPrice(size.surcharge)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenSizeDialog(size)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topping Tab */}
          <TabsContent value="topping">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => handleOpenToppingDialog()}
                className="bg-[#8B7355] hover:bg-[#6F5B44]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm topping
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã topping</TableHead>
                      <TableHead>Tên topping</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toppings.map((topping) => (
                      <TableRow key={topping.id}>
                        <TableCell className="font-mono text-sm">{topping.id}</TableCell>
                        <TableCell className="font-medium">{topping.name}</TableCell>
                        <TableCell className="font-semibold text-[#8B7355]">
                          {formatPrice(topping.price)}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Còn hàng
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenToppingDialog(topping)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTopping(topping.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Size Dialog */}
        <Dialog open={isSizeDialogOpen} onOpenChange={setIsSizeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa size</DialogTitle>
              <DialogDescription>Cập nhật phụ thu cho size</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSizeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size-name">Tên size</Label>
                <Input
                  id="size-name"
                  value={sizeFormData.name}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, name: e.target.value })}
                  placeholder="M, L, XL..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surcharge">Phụ thu (VNĐ)</Label>
                <Input
                  id="surcharge"
                  type="number"
                  value={sizeFormData.surcharge}
                  onChange={(e) =>
                    setSizeFormData({ ...sizeFormData, surcharge: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSizeDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  Cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Topping Dialog */}
        <Dialog open={isToppingDialogOpen} onOpenChange={setIsToppingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTopping ? 'Chỉnh sửa topping' : 'Thêm topping mới'}
              </DialogTitle>
              <DialogDescription>
                {editingTopping ? 'Cập nhật thông tin topping' : 'Nhập thông tin topping mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleToppingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topping-name">Tên topping *</Label>
                <Input
                  id="topping-name"
                  value={toppingFormData.name}
                  onChange={(e) =>
                    setToppingFormData({ ...toppingFormData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Trân châu đen"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topping-price">Giá (VNĐ) *</Label>
                <Input
                  id="topping-price"
                  type="number"
                  value={toppingFormData.price}
                  onChange={(e) =>
                    setToppingFormData({ ...toppingFormData, price: e.target.value })
                  }
                  placeholder="5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topping-status">Trạng thái</Label>
                <Select
                  value={toppingFormData.status}
                  onValueChange={(value) =>
                    setToppingFormData({ ...toppingFormData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Còn hàng">Còn hàng</SelectItem>
                    <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsToppingDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingTopping ? 'Cập nhật' : 'Thêm topping'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
