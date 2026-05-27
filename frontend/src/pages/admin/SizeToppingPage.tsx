import { useEffect, useState } from 'react';
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
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  createSize,
  deleteSize,
  getSizes,
  updateSize,
  type Size,
} from '@/services/sizeService';
import {
  createTopping,
  deleteTopping,
  getToppings,
  updateTopping,
  type Topping,
} from '@/services/toppingService';
import { toast } from 'sonner';

const SIZE_STATUS_OPTIONS = [
  { value: 'DangApDung', label: 'Đang áp dụng' },
  { value: 'NgungApDung', label: 'Ngưng áp dụng' },
];

const TOPPING_STATUS_OPTIONS = [
  { value: 'DangBan', label: 'Còn hàng' },
  { value: 'NgungBan', label: 'Ngưng bán' },
];

type SizeFormData = {
  name: string;
  surcharge: string;
  status: string;
};

type ToppingFormData = {
  name: string;
  price: string;
  status: string;
};

export function SizeToppingPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const [isToppingDialogOpen, setIsToppingDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [sizeFormData, setSizeFormData] = useState<SizeFormData>({
    name: '',
    surcharge: '0',
    status: 'DangApDung',
  });
  const [toppingFormData, setToppingFormData] = useState<ToppingFormData>({
    name: '',
    price: '0',
    status: 'DangBan',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sizeData, toppingData] = await Promise.all([getSizes(), getToppings()]);
      setSizes(sizeData);
      setToppings(toppingData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được size và topping');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusLabel = (value: string, options: { value: string; label: string }[]) => {
    return options.find((item) => item.value === value)?.label ?? value;
  };

  const getStatusClassName = (status: string) => {
    return status === 'DangApDung' || status === 'DangBan'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const handleOpenSizeDialog = (size?: Size) => {
    if (size) {
      setEditingSize(size);
      setSizeFormData({
        name: size.name,
        surcharge: String(size.phuThu),
        status: size.trangThai,
      });
    } else {
      setEditingSize(null);
      setSizeFormData({ name: '', surcharge: '0', status: 'DangApDung' });
    }
    setIsSizeDialogOpen(true);
  };

  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phuThu = Number(sizeFormData.surcharge);
    if (Number.isNaN(phuThu) || phuThu < 0) {
      toast.error('Phụ thu size phải là số không âm.');
      return;
    }

    try {
      const payload = {
        tenSize: sizeFormData.name.trim(),
        phuThu,
        trangThai: sizeFormData.status,
      };

      if (editingSize) {
        await updateSize(editingSize.maSize, payload);
        toast.success('Cập nhật size thành công!');
      } else {
        await createSize(payload);
        toast.success('Thêm size thành công!');
      }

      setIsSizeDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu size thất bại');
    }
  };

  const handleDeleteSize = async (size: Size) => {
    if (!confirm(`Bạn có chắc muốn xóa size ${size.name}?`)) return;

    try {
      await deleteSize(size.maSize);
      toast.success('Xóa size thành công!');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa size thất bại');
    }
  };

  const handleOpenToppingDialog = (topping?: Topping) => {
    if (topping) {
      setEditingTopping(topping);
      setToppingFormData({
        name: topping.name,
        price: String(topping.price),
        status: topping.trangThai,
      });
    } else {
      setEditingTopping(null);
      setToppingFormData({ name: '', price: '0', status: 'DangBan' });
    }
    setIsToppingDialogOpen(true);
  };

  const handleToppingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const donGia = Number(toppingFormData.price);
    if (Number.isNaN(donGia) || donGia < 0) {
      toast.error('Giá topping phải là số không âm.');
      return;
    }

    try {
      const payload = {
        tenTopping: toppingFormData.name.trim(),
        donGia,
        trangThai: toppingFormData.status,
      };

      if (editingTopping) {
        await updateTopping(editingTopping.maTopping, payload);
        toast.success('Cập nhật topping thành công!');
      } else {
        await createTopping(payload);
        toast.success('Thêm topping thành công!');
      }

      setIsToppingDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu topping thất bại');
    }
  };

  const handleDeleteTopping = async (topping: Topping) => {
    if (!confirm(`Bạn có chắc muốn xóa topping ${topping.name}?`)) return;

    try {
      await deleteTopping(topping.maTopping);
      toast.success('Xóa topping thành công!');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa topping thất bại');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Size & Topping</h1>
            <p className="text-gray-600 mt-1">Quản lý size và topping sản phẩm</p>
          </div>
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tải lại
          </Button>
        </div>

        <ModuleNotice owner="Trần Quốc Tiên" module="quản lý size & topping" />

        <Tabs defaultValue="size" className="space-y-6">
          <TabsList>
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="topping">Topping</TabsTrigger>
          </TabsList>

          <TabsContent value="size">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => handleOpenSizeDialog()}
                className="bg-[#8B7355] hover:bg-[#6F5B44]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm size
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã size</TableHead>
                      <TableHead>Tên size</TableHead>
                      <TableHead>Phụ thu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizes.map((size) => (
                      <TableRow key={size.id}>
                        <TableCell className="font-mono text-sm">{size.maSize}</TableCell>
                        <TableCell className="font-medium">Size {size.name}</TableCell>
                        <TableCell>
                          {size.phuThu === 0 ? (
                            <span className="text-gray-500">Không phụ thu</span>
                          ) : (
                            <span className="text-[#8B7355] font-semibold">
                              +{formatPrice(size.phuThu)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassName(
                              size.trangThai
                            )}`}
                          >
                            {getStatusLabel(size.trangThai, SIZE_STATUS_OPTIONS)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSizeDialog(size)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSize(size)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sizes.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Chưa có size nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

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
                        <TableCell className="font-mono text-sm">{topping.maTopping}</TableCell>
                        <TableCell className="font-medium">{topping.name}</TableCell>
                        <TableCell className="font-semibold text-[#8B7355]">
                          {formatPrice(topping.price)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassName(
                              topping.trangThai
                            )}`}
                          >
                            {getStatusLabel(topping.trangThai, TOPPING_STATUS_OPTIONS)}
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
                              onClick={() => handleDeleteTopping(topping)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {toppings.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Chưa có topping nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isSizeDialogOpen} onOpenChange={setIsSizeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSize ? 'Chỉnh sửa size' : 'Thêm size mới'}</DialogTitle>
              <DialogDescription>
                {editingSize ? 'Cập nhật thông tin size' : 'Nhập thông tin size mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSizeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size-name">Tên size *</Label>
                <Input
                  id="size-name"
                  value={sizeFormData.name}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, name: e.target.value })}
                  placeholder="M, L, XL..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surcharge">Phụ thu (VNĐ) *</Label>
                <Input
                  id="surcharge"
                  type="number"
                  min="0"
                  value={sizeFormData.surcharge}
                  onChange={(e) =>
                    setSizeFormData({ ...sizeFormData, surcharge: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size-status">Trạng thái</Label>
                <Select
                  value={sizeFormData.status}
                  onValueChange={(value) => setSizeFormData({ ...sizeFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_STATUS_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsSizeDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingSize ? 'Cập nhật' : 'Thêm size'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isToppingDialogOpen} onOpenChange={setIsToppingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTopping ? 'Chỉnh sửa topping' : 'Thêm topping mới'}</DialogTitle>
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
                  min="0"
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
                    {TOPPING_STATUS_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
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
