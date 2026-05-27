import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ModuleNotice } from '@/components/common/ModuleNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
  type CategoryStatus,
} from '@/services/categoryService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type FormData = {
  name: string;
  moTa: string;
  thuTuHienThi: string;
  trangThai: CategoryStatus;
};

const emptyForm: FormData = {
  name: '',
  moTa: '',
  thuTuHienThi: '0',
  trangThai: 'HienThi',
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        moTa: category.moTa ?? '',
        thuTuHienThi: String(category.thuTuHienThi),
        trangThai: category.trangThai,
      });
    } else {
      setEditingCategory(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tenDanhMuc = formData.name.trim();
    if (!tenDanhMuc) {
      toast.error('Tên danh mục không được để trống!');
      return;
    }

    const payload = {
      tenDanhMuc,
      moTa: formData.moTa.trim() || null,
      thuTuHienThi: Number(formData.thuTuHienThi) || 0,
      trangThai: formData.trangThai,
    };

    setSaving(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.maDanhMuc, payload);
        setCategories((prev) =>
          prev.map((c) => (c.maDanhMuc === updated.maDanhMuc ? updated : c))
        );
        toast.success('Cập nhật danh mục thành công!');
      } else {
        const created = await createCategory(payload);
        setCategories((prev) => [...prev, created].sort((a, b) => a.thuTuHienThi - b.thuTuHienThi));
        toast.success('Thêm danh mục thành công!');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu danh mục thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.productCount > 0) {
      toast.error('Không thể xóa danh mục đang có sản phẩm!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) return;

    try {
      await deleteCategory(category.maDanhMuc);
      setCategories((prev) => prev.filter((c) => c.maDanhMuc !== category.maDanhMuc));
      toast.success('Xóa danh mục thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa danh mục thất bại!');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
            <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#8B7355] hover:bg-[#6F5B44]">
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục
          </Button>
        </div>

        <ModuleNotice owner="Trần Quốc Tiên" module="quản lý danh mục" />

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadCategories}>Tải lại</Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Chưa có dữ liệu.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Số sản phẩm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-sm">{category.maDanhMuc}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.moTa || '-'}</TableCell>
                      <TableCell>{category.thuTuHienThi}</TableCell>
                      <TableCell>
                        <Badge variant={category.trangThai === 'HienThi' ? 'default' : 'secondary'}>
                          {category.trangThai === 'HienThi' ? 'Hiển thị' : 'Ẩn'}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.productCount} sản phẩm</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Cập nhật thông tin danh mục' : 'Nhập thông tin danh mục mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Trà sữa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moTa">Mô tả</Label>
                <Textarea
                  id="moTa"
                  value={formData.moTa}
                  onChange={(e) => setFormData((prev) => ({ ...prev, moTa: e.target.value }))}
                  placeholder="Mô tả ngắn về danh mục"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thuTuHienThi">Thứ tự hiển thị</Label>
                  <Input
                    id="thuTuHienThi"
                    type="number"
                    value={formData.thuTuHienThi}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thuTuHienThi: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={formData.trangThai}
                    onValueChange={(value: CategoryStatus) =>
                      setFormData((prev) => ({ ...prev, trangThai: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HienThi">Hiển thị</SelectItem>
                      <SelectItem value="An">Ẩn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
