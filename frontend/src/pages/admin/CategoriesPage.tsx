import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ModuleNotice } from '@/components/common/ModuleNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { getCategories, type Category } from '@/services/categoryService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    setLoading(true);
    setError('');
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, name: formData.name } : c
        )
      );
      toast.success('Cập nhật danh mục thành công!');
    } else {
      const newCategory: Category = {
        id: (categories.length + 1).toString(),
        name: formData.name,
        productCount: 0,
      };
      setCategories([...categories, newCategory]);
      toast.success('Thêm danh mục thành công!');
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category && category.productCount > 0) {
      toast.error('Không thể xóa danh mục đang có sản phẩm!');
      return;
    }

    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      setCategories(categories.filter((c) => c.id !== id));
      toast.success('Xóa danh mục thành công!');
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
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Chưa có dữ liệu.</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã danh mục</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Số sản phẩm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.productCount} sản phẩm</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
              <DialogTitle>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </DialogTitle>
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
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ví dụ: Trà sữa"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
