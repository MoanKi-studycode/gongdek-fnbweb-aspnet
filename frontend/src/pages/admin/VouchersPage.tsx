import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
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
import { Plus, Edit, Trash2, Ticket } from 'lucide-react';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherStatusBadge } from '@/services/voucherService';
import type { Voucher } from '@/types';
import { deleteConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';
import { toast } from 'sonner';

export function VouchersPage() {
  const { confirm } = useConfirm();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PHAN_TRAM' as 'PHAN_TRAM' | 'SO_TIEN',
    value: '',
    minOrder: '',
    maxDiscount: '',
    expiryDate: '',
  });

  useEffect(() => {
    getVouchers().then(setVouchers);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  const handleOpenDialog = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value.toString(),
        minOrder: voucher.minOrder.toString(),
        maxDiscount: voucher.maxDiscount?.toString() || '',
        expiryDate: voucher.expiryDate,
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        name: '',
        type: 'PHAN_TRAM',
        value: '',
        minOrder: '',
        maxDiscount: '',
        expiryDate: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      maCode: formData.code,
      moTa: formData.name,
      loaiGiam: formData.type,
      giaTriGiam: parseFloat(formData.value),
      donHangToiThieu: parseFloat(formData.minOrder) || 0,
      giamToiDa: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      ngayBatDau: '2026-01-01',
      ngayKetThuc: formData.expiryDate,
    };

    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, payload);
        toast.success('Cập nhật voucher thành công!');
      } else {
        await createVoucher(payload);
        toast.success('Thêm voucher thành công!');
      }
      setVouchers(await getVouchers());
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu voucher thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm(deleteConfirmOptions('voucher'));
    if (!ok) return;
    try {
      await deleteVoucher(id);
      setVouchers(await getVouchers());
      notifySuccess(toastMessages.deleteSuccess);
    } catch (err) {
      notifyError(err, 'Xóa voucher thất bại');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý voucher</h1>
            <p className="text-gray-600 mt-1">Quản lý mã giảm giá và khuyến mãi</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#8B7355] hover:bg-[#6F5B44]">
            <Plus className="w-4 h-4 mr-2" />
            Tạo voucher mới
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã voucher</TableHead>
                  <TableHead>Tên voucher</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Đơn tối thiểu</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => {
                  const statusBadge = getVoucherStatusBadge(voucher);

                  return (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Ticket className="w-4 h-4 text-[#8B7355] mr-2" />
                          <span className="font-mono font-semibold">{voucher.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{voucher.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {voucher.type === 'PHAN_TRAM' ? 'Giảm %' : 'Giảm tiền'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-[#8B7355]">
                        {voucher.type === 'PHAN_TRAM'
                          ? `${voucher.value}%`
                          : formatPrice(voucher.value)}
                        {voucher.maxDiscount && voucher.type === 'PHAN_TRAM' && (
                          <span className="text-xs text-gray-500 block">
                            Tối đa {formatPrice(voucher.maxDiscount)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(voucher.minOrder)}</TableCell>
                      <TableCell>{formatDate(voucher.expiryDate)}</TableCell>
                      <TableCell>
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        {voucher.status === 'ConHieuLuc' && isExpired(voucher.expiryDate) && (
                          <p className="text-xs text-gray-500 mt-1">Quá ngày kết thúc</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(voucher)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(voucher.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
              </DialogTitle>
              <DialogDescription>
                {editingVoucher
                  ? 'Cập nhật thông tin voucher'
                  : 'Nhập thông tin voucher mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Mã voucher *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="GIAM10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Tên voucher *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Giảm 10%"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Loại voucher *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHAN_TRAM">Giảm theo %</SelectItem>
                      <SelectItem value="SO_TIEN">Giảm theo số tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Giá trị * ({formData.type === 'PHAN_TRAM' ? '%' : 'VNĐ'})
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PHAN_TRAM' ? '10' : '10000'}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minOrder">Đơn tối thiểu (VNĐ) *</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>

                {formData.type === 'PHAN_TRAM' && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Giảm tối đa (VNĐ)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: e.target.value })
                      }
                      placeholder="20000"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Hạn sử dụng *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingVoucher ? 'Cập nhật' : 'Tạo voucher'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

