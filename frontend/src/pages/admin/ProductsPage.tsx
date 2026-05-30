import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
  uploadProductImage,
  type AdminProduct,
  type ProductStatus,
} from '@/services/productService';
import { resolveProductImageUrl } from '@/lib/productImage';
import { getCategories, type Category } from '@/services/categoryService';
import { toast } from 'sonner';
import { deleteConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const STATUS_LABEL: Record<ProductStatus, string> = {
  DangBan: 'Đang bán',
  NgungBan: 'Ngưng bán',
  HetHang: 'Hết hàng',
};

const STATUS_CLASS: Record<ProductStatus, string> = {
  DangBan: 'bg-green-100 text-green-700',
  NgungBan: 'bg-gray-100 text-gray-700',
  HetHang: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  tenSanPham: '',
  maDanhMuc: '',
  giaBanGoc: '',
  moTa: '',
  hinhAnh: '',
  ghiChuPhaChe: '',
  trangThai: 'DangBan' as ProductStatus,
};

export function ProductsPage() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data.filter((category) => category.trangThai === 'HienThi'));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminProducts({
        search: searchQuery,
        maDanhMuc: categoryFilter === 'all' ? null : Number(categoryFilter),
      });
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    loadCategories().catch((err) => {
      const message = err instanceof Error ? err.message : 'Không thể tải danh mục.';
      toast.error(message);
    });
  }, [loadCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const handleOpenDialog = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        tenSanPham: product.name,
        maDanhMuc: String(product.maDanhMuc),
        giaBanGoc: String(product.price),
        moTa: product.description,
        hinhAnh: product.hinhAnh ?? '',
        ghiChuPhaChe: product.ghiChuPhaChe ?? '',
        trangThai: product.trangThai,
      });
    } else {
      setEditingProduct(null);
      setFormData({ ...EMPTY_FORM });
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const buildPayload = () => {
    const maDanhMuc = Number(formData.maDanhMuc);
    const giaBanGoc = Number(formData.giaBanGoc);

    if (!formData.tenSanPham.trim()) {
      throw new Error('Vui lòng nhập tên sản phẩm.');
    }

    if (!maDanhMuc) {
      throw new Error('Vui lòng chọn danh mục.');
    }

    if (Number.isNaN(giaBanGoc) || giaBanGoc < 0) {
      throw new Error('Giá bán gốc không hợp lệ.');
    }

    return {
      tenSanPham: formData.tenSanPham.trim(),
      maDanhMuc,
      giaBanGoc,
      moTa: formData.moTa.trim() || null,
      hinhAnh: formData.hinhAnh.trim() || null,
      ghiChuPhaChe: formData.ghiChuPhaChe.trim() || null,
      trangThai: formData.trangThai,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();
      let saved: AdminProduct;
      if (editingProduct) {
        saved = await updateProduct(editingProduct.maSanPham, payload);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        saved = await createProduct(payload);
        toast.success('Thêm sản phẩm thành công!');
      }

      if (imageFile) {
        await uploadProductImage(saved.maSanPham, imageFile);
        toast.success('Đã upload ảnh sản phẩm.');
      }

      setIsDialogOpen(false);
      await loadProducts();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    const ok = await confirm(
      deleteConfirmOptions(
        'sản phẩm',
        `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không? Thao tác này không thể hoàn tác.`,
      ),
    );
    if (!ok) return;

    try {
      await deleteProduct(product.maSanPham);
      notifySuccess(toastMessages.deleteSuccess);
      await loadProducts();
      await loadCategories();
    } catch (err) {
      notifyError(err, 'Không thể xóa sản phẩm.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm trong hệ thống</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#8B7355] hover:bg-[#6F5B44]">
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px_auto] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên, mô tả hoặc danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.maDanhMuc} value={String(category.maDanhMuc)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={loadProducts}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải lại
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Chưa có dữ liệu.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã SP</TableHead>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.maSanPham}</TableCell>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                          onError={(event) => {
                            event.currentTarget.src = '/images/products/default.jpg';
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.ghiChuPhaChe ? (
                          <div className="text-xs text-gray-500 line-clamp-1">{product.ghiChuPhaChe}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-[#E8DCC4] text-[#8B7355] rounded-full text-xs font-medium">
                          {product.tenDanhMuc}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-[#8B7355]">{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[product.trangThai]}`}>
                          {STATUS_LABEL[product.trangThai]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
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
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? 'Cập nhật thông tin sản phẩm'
                  : 'Nhập thông tin sản phẩm mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenSanPham">Tên sản phẩm *</Label>
                  <Input
                    id="tenSanPham"
                    value={formData.tenSanPham}
                    onChange={(e) => setFormData({ ...formData, tenSanPham: e.target.value })}
                    placeholder="Ví dụ: Trà sữa đường đen"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maDanhMuc">Danh mục *</Label>
                  <Select
                    value={formData.maDanhMuc}
                    onValueChange={(value) => setFormData({ ...formData, maDanhMuc: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.maDanhMuc} value={String(category.maDanhMuc)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="giaBanGoc">Giá bán gốc (VNĐ) *</Label>
                  <Input
                    id="giaBanGoc"
                    type="number"
                    min="0"
                    value={formData.giaBanGoc}
                    onChange={(e) => setFormData({ ...formData, giaBanGoc: e.target.value })}
                    placeholder="35000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trangThai">Trạng thái</Label>
                  <Select
                    value={formData.trangThai}
                    onValueChange={(value) => setFormData({ ...formData, trangThai: value as ProductStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DangBan">Đang bán</SelectItem>
                      <SelectItem value="HetHang">Hết hàng</SelectItem>
                      <SelectItem value="NgungBan">Ngưng bán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moTa">Mô tả</Label>
                <Textarea
                  id="moTa"
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  placeholder="Mô tả sản phẩm..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ghiChuPhaChe">Ghi chú pha chế</Label>
                <Textarea
                  id="ghiChuPhaChe"
                  value={formData.ghiChuPhaChe}
                  onChange={(e) => setFormData({ ...formData, ghiChuPhaChe: e.target.value })}
                  placeholder="Ví dụ: mặc định 50% đường, ít đá..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hinhAnh">Ảnh sản phẩm</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
                {(imageFile || editingProduct?.hinhAnh) && (
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : resolveProductImageUrl(editingProduct?.hinhAnh, editingProduct?.maSanPham)
                    }
                    alt="Xem trước"
                    className="h-24 w-24 rounded-md object-cover border"
                  />
                )}
                <Input
                  id="hinhAnh"
                  value={formData.hinhAnh}
                  onChange={(e) => setFormData({ ...formData, hinhAnh: e.target.value })}
                  placeholder="/images/products/1.jpg (tùy chọn nếu không upload file)"
                />
                <p className="text-xs text-gray-500">
                  Chọn file ảnh để upload lên server, hoặc nhập đường dẫn thủ công.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
