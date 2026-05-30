import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { deleteConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Edit, Plus, RefreshCw, Search, Trash2, Truck, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createNhaCungCap,
  deleteNhaCungCap,
  getNhaCungCaps,
  updateNhaCungCap,
  type NhaCungCap,
  type NhaCungCapStatus,
} from '@/services/inventoryService';

type SupplierForm = {
  tenNCC: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  nguoiLienHe: string;
  trangThai: NhaCungCapStatus;
};

const defaultForm: SupplierForm = {
  tenNCC: '',
  soDienThoai: '',
  email: '',
  diaChi: '',
  nguoiLienHe: '',
  trangThai: 'DangHopTac',
};

const statusLabels: Record<NhaCungCapStatus, string> = {
  DangHopTac: 'Đang hợp tác',
  NgungHopTac: 'Ngừng hợp tác',
};

const statusColors: Record<NhaCungCapStatus, string> = {
  DangHopTac: 'bg-green-100 text-green-700',
  NgungHopTac: 'bg-gray-100 text-gray-700',
};

export function SuppliersPage() {
  const { confirm } = useConfirm();
  const [suppliers, setSuppliers] = useState<NhaCungCap[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | NhaCungCapStatus>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NhaCungCap | null>(null);
  const [form, setForm] = useState<SupplierForm>(defaultForm);

  const loadSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNhaCungCaps();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhà cung cấp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return suppliers.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.trangThai === statusFilter;
      if (!matchesStatus) return false;
      if (!keyword) return true;
      return (
        item.tenNCC.toLowerCase().includes(keyword) ||
        (item.nguoiLienHe ?? '').toLowerCase().includes(keyword) ||
        (item.soDienThoai ?? '').toLowerCase().includes(keyword) ||
        (item.email ?? '').toLowerCase().includes(keyword) ||
        (item.diaChi ?? '').toLowerCase().includes(keyword) ||
        String(item.maNCC).includes(keyword)
      );
    });
  }, [suppliers, search, statusFilter]);

  const activeCount = suppliers.filter((s) => s.trangThai === 'DangHopTac').length;
  const inactiveCount = suppliers.length - activeCount;

  const openDialog = (item?: NhaCungCap) => {
    if (item) {
      setEditing(item);
      setForm({
        tenNCC: item.tenNCC,
        soDienThoai: item.soDienThoai ?? '',
        email: item.email ?? '',
        diaChi: item.diaChi ?? '',
        nguoiLienHe: item.nguoiLienHe ?? '',
        trangThai: item.trangThai,
      });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const tenNCC = form.tenNCC.trim();
    if (!tenNCC) {
      toast.error('Tên nhà cung cấp không được để trống.');
      return;
    }

    const payload = {
      tenNCC,
      soDienThoai: form.soDienThoai.trim() || null,
      email: form.email.trim() || null,
      diaChi: form.diaChi.trim() || null,
      nguoiLienHe: form.nguoiLienHe.trim() || null,
      trangThai: form.trangThai,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateNhaCungCap(editing.maNCC, payload);
        notifySuccess(toastMessages.updateSuccess);
      } else {
        await createNhaCungCap(payload);
        notifySuccess(toastMessages.createSuccess);
      }
      setIsDialogOpen(false);
      await loadSuppliers();
    } catch (err) {
      notifyError(err, toastMessages.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NhaCungCap) => {
    const ok = await confirm(
      deleteConfirmOptions('nhà cung cấp', `Bạn có chắc muốn xóa "${item.tenNCC}"?`),
    );
    if (!ok) return;

    try {
      await deleteNhaCungCap(item.maNCC);
      notifySuccess(toastMessages.deleteSuccess);
      await loadSuppliers();
    } catch (err) {
      notifyError(err, 'Không thể xóa nhà cung cấp.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin liên hệ, trạng thái hợp tác và theo dõi phiếu nhập kho
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadSuppliers} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tải lại
            </Button>
            <Button onClick={() => openDialog()} className="bg-[#8B7355] hover:bg-[#6F5B44]">
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhà cung cấp
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#8B7355]" />
              <div>
                <p className="text-sm text-gray-600">Tổng nhà cung cấp</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Truck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Đang hợp tác</p>
                <p className="text-2xl font-bold text-green-700">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Truck className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngừng hợp tác</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo mã, tên, SĐT, email, địa chỉ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'ALL' | NhaCungCapStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="DangHopTac">Đang hợp tác</SelectItem>
                  <SelectItem value="NgungHopTac">Ngừng hợp tác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Không tìm thấy nhà cung cấp</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên nhà cung cấp</TableHead>
                    <TableHead>Người liên hệ</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Phiếu nhập</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((item) => (
                    <TableRow key={item.maNCC}>
                      <TableCell className="font-mono text-sm">
                        NCC{String(item.maNCC).padStart(3, '0')}
                      </TableCell>
                      <TableCell className="font-medium">{item.tenNCC}</TableCell>
                      <TableCell>{item.nguoiLienHe || '—'}</TableCell>
                      <TableCell>{item.soDienThoai || '—'}</TableCell>
                      <TableCell>{item.email || '—'}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.diaChi ?? ''}>
                        {item.diaChi || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[item.trangThai]}>
                          {statusLabels[item.trangThai]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.soPhieuNhap > 0 ? (
                          <Link
                            to="/admin/stock-in"
                            className="text-[#8B7355] hover:underline font-medium"
                          >
                            {item.soPhieuNhap} phiếu
                          </Link>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
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
              <DialogTitle>{editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
              <DialogDescription>Nhập thông tin liên hệ và trạng thái hợp tác.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Tên nhà cung cấp *</Label>
                  <Input
                    value={form.tenNCC}
                    onChange={(e) => setForm({ ...form, tenNCC: e.target.value })}
                    placeholder="Công ty nguyên liệu ABC"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Người liên hệ</Label>
                  <Input
                    value={form.nguoiLienHe}
                    onChange={(e) => setForm({ ...form, nguoiLienHe: e.target.value })}
                    placeholder="Anh Nam"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={form.soDienThoai}
                    onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                    placeholder="0909123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="abc@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select
                    value={form.trangThai}
                    onValueChange={(value: NhaCungCapStatus) =>
                      setForm({ ...form, trangThai: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DangHopTac">Đang hợp tác</SelectItem>
                      <SelectItem value="NgungHopTac">Ngừng hợp tác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={form.diaChi}
                    onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                    placeholder="Nha Trang, Khánh Hòa"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#8B7355] hover:bg-[#6F5B44]"
                >
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm nhà cung cấp'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
