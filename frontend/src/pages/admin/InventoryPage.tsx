import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ModuleNotice } from '@/components/common/ModuleNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Edit, Search, AlertTriangle, Package } from 'lucide-react';
import {
  getInventoryItems,
  getInventoryStatus,
  getLowStockItems,
} from '@/services/inventoryService';
import type { InventoryItem, InventoryUnit } from '@/types';
import { toast } from 'sonner';

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Nguyên liệu chính',
    currentStock: '',
    unit: 'kg' as InventoryUnit,
    minStock: '',
    maxStock: '',
  });

  useEffect(() => {
    getInventoryItems().then(setInventory);
  }, []);

  const categories = ['ALL', 'Nguyên liệu chính', 'Topping', 'Vật tư'];

  const getStatusBadge = (item: InventoryItem) => {
    const status = getInventoryStatus(item);
    const colors = {
      'Đủ hàng': 'bg-green-100 text-green-700',
      'Sắp hết': 'bg-yellow-100 text-yellow-700',
      'Hết hàng': 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = getLowStockItems().length;

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        currentStock: item.currentStock.toString(),
        unit: item.unit,
        minStock: item.minStock.toString(),
        maxStock: item.maxStock.toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Nguyên liệu chính',
        currentStock: '',
        unit: 'kg',
        minStock: '',
        maxStock: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenAdjustDialog = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustAmount('');
    setAdjustType('add');
    setIsAdjustDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      setInventory(
        inventory.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                currentStock: parseFloat(formData.currentStock),
                unit: formData.unit,
                minStock: parseFloat(formData.minStock),
                maxStock: parseFloat(formData.maxStock),
                lastUpdated: new Date().toISOString(),
              }
            : item
        )
      );
      toast.success('Cập nhật kho thành công!');
    } else {
      const newItem: InventoryItem = {
        id: `INV${String(inventory.length + 1).padStart(3, '0')}`,
        name: formData.name,
        category: formData.category,
        currentStock: parseFloat(formData.currentStock),
        unit: formData.unit,
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        lastUpdated: new Date().toISOString(),
      };
      setInventory([...inventory, newItem]);
      toast.success('Thêm vật tư thành công!');
    }

    setIsDialogOpen(false);
  };

  const handleAdjustStock = () => {
    if (!adjustingItem || !adjustAmount) return;

    const amount = parseFloat(adjustAmount);
    if (amount <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setInventory(
      inventory.map((item) => {
        if (item.id === adjustingItem.id) {
          const newStock =
            adjustType === 'add'
              ? item.currentStock + amount
              : Math.max(0, item.currentStock - amount);

          return {
            ...item,
            currentStock: newStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    toast.success(
      adjustType === 'add' ? 'Nhập kho thành công!' : 'Xuất kho thành công!'
    );
    setIsAdjustDialogOpen(false);
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

  return (
    <AdminLayout>
      <div className="p-8">
        <ModuleNotice owner="Trần Quốc Tiên" module="quản lý kho nguyên liệu" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
            <p className="text-gray-600 mt-1">Quản lý nguyên liệu và tồn kho</p>
          </div>
          <div className="flex items-center gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cảnh báo sắp hết</p>
                    <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#8B7355] hover:bg-[#6F5B44]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm vật tư
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã hoặc tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'ALL' ? 'Tất cả danh mục' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã kho</TableHead>
                  <TableHead>Tên vật tư</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Tối thiểu</TableHead>
                  <TableHead>Tối đa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const status = getInventoryStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.category}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            status === 'Sắp hết' || status === 'Hết hàng'
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.minStock} {item.unit}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.maxStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(item)}>{status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(item.lastUpdated)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAdjustDialog(item)}
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Điều chỉnh
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Không tìm thấy vật tư</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Cập nhật thông tin vật tư' : 'Nhập thông tin vật tư mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Tên vật tư *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Trân châu đen"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nguyên liệu chính">Nguyên liệu chính</SelectItem>
                      <SelectItem value="Topping">Topping</SelectItem>
                      <SelectItem value="Vật tư">Vật tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: InventoryUnit) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lít">lít</SelectItem>
                      <SelectItem value="gói">gói</SelectItem>
                      <SelectItem value="hộp">hộp</SelectItem>
                      <SelectItem value="chai">chai</SelectItem>
                      <SelectItem value="cái">cái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStock">Tồn kho hiện tại *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    step="0.01"
                    value={formData.currentStock}
                    onChange={(e) =>
                      setFormData({ ...formData, currentStock: e.target.value })
                    }
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Tồn kho tối thiểu *</Label>
                  <Input
                    id="minStock"
                    type="number"
                    step="0.01"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStock">Tồn kho tối đa *</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    step="0.01"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingItem ? 'Cập nhật' : 'Thêm vật tư'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Adjust Stock Dialog */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
              <DialogDescription>
                {adjustingItem && `${adjustingItem.name} - Hiện tại: ${adjustingItem.currentStock} ${adjustingItem.unit}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Loại điều chỉnh</Label>
                <Select
                  value={adjustType}
                  onValueChange={(value: 'add' | 'subtract') => setAdjustType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Nhập kho (+)</SelectItem>
                    <SelectItem value="subtract">Xuất kho (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustAmount">Số lượng</Label>
                <Input
                  id="adjustAmount"
                  type="number"
                  step="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              {adjustingItem && adjustAmount && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Tồn kho sau điều chỉnh:</p>
                  <p className="text-lg font-bold text-[#8B7355]">
                    {adjustType === 'add'
                      ? adjustingItem.currentStock + parseFloat(adjustAmount)
                      : Math.max(0, adjustingItem.currentStock - parseFloat(adjustAmount))}{' '}
                    {adjustingItem.unit}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAdjustStock}
                  className="bg-[#8B7355] hover:bg-[#6F5B44]"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
