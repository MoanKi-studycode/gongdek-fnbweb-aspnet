import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Search, AlertTriangle, Package, Trash2, Truck } from 'lucide-react';
import {
  createNguyenLieu,
  createNhaCungCap,
  deleteNguyenLieu,
  deleteNhaCungCap,
  dieuChinhTonKho,
  getNguyenLieus,
  getNhaCungCaps,
  updateNguyenLieu,
  updateNhaCungCap,
  type DieuChinhTonLoai,
  type NguyenLieu,
  type NguyenLieuStatus,
  type NhaCungCap,
  type NhaCungCapStatus,
} from '@/services/inventoryService';
import { toast } from 'sonner';

type NguyenLieuForm = {
  tenNL: string;
  donViTinh: string;
  soLuongTon: string;
  soLuongCanhBao: string;
  hanSuDungGanNhat: string;
  trangThai: NguyenLieuStatus;
};

type NhaCungCapForm = {
  tenNCC: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  nguoiLienHe: string;
  trangThai: NhaCungCapStatus;
};

const defaultNguyenLieuForm: NguyenLieuForm = {
  tenNL: '',
  donViTinh: 'kg',
  soLuongTon: '',
  soLuongCanhBao: '',
  hanSuDungGanNhat: '',
  trangThai: 'ConHang',
};

const defaultNhaCungCapForm: NhaCungCapForm = {
  tenNCC: '',
  soDienThoai: '',
  email: '',
  diaChi: '',
  nguoiLienHe: '',
  trangThai: 'DangHopTac',
};

const nguyenLieuStatusLabels: Record<NguyenLieuStatus, string> = {
  ConHang: 'Còn hàng',
  SapHet: 'Sắp hết',
  HetHang: 'Hết hàng',
  NgungSuDung: 'Ngừng sử dụng',
};

const nhaCungCapStatusLabels: Record<NhaCungCapStatus, string> = {
  DangHopTac: 'Đang hợp tác',
  NgungHopTac: 'Ngừng hợp tác',
};

const statusColors: Record<string, string> = {
  ConHang: 'bg-green-100 text-green-700',
  SapHet: 'bg-yellow-100 text-yellow-700',
  HetHang: 'bg-red-100 text-red-700',
  NgungSuDung: 'bg-gray-100 text-gray-700',
  DangHopTac: 'bg-green-100 text-green-700',
  NgungHopTac: 'bg-gray-100 text-gray-700',
};

export function InventoryPage() {
  const [nguyenLieus, setNguyenLieus] = useState<NguyenLieu[]>([]);
  const [nhaCungCaps, setNhaCungCaps] = useState<NhaCungCap[]>([]);
  const [searchNguyenLieu, setSearchNguyenLieu] = useState('');
  const [searchNhaCungCap, setSearchNhaCungCap] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const [isNguyenLieuDialogOpen, setIsNguyenLieuDialogOpen] = useState(false);
  const [isNhaCungCapDialogOpen, setIsNhaCungCapDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [editingNguyenLieu, setEditingNguyenLieu] = useState<NguyenLieu | null>(null);
  const [editingNhaCungCap, setEditingNhaCungCap] = useState<NhaCungCap | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<NguyenLieu | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<DieuChinhTonLoai>('Nhap');

  const [nguyenLieuForm, setNguyenLieuForm] = useState<NguyenLieuForm>(defaultNguyenLieuForm);
  const [nhaCungCapForm, setNhaCungCapForm] = useState<NhaCungCapForm>(defaultNhaCungCapForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nguyenLieuData, nhaCungCapData] = await Promise.all([
        getNguyenLieus(),
        getNhaCungCaps(),
      ]);
      setNguyenLieus(nguyenLieuData);
      setNhaCungCaps(nhaCungCapData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredNguyenLieus = useMemo(() => {
    const keyword = searchNguyenLieu.trim().toLowerCase();
    return nguyenLieus.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.tenNL.toLowerCase().includes(keyword) ||
        String(item.maNL).includes(keyword) ||
        item.donViTinh.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || item.trangThai === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [nguyenLieus, searchNguyenLieu, statusFilter]);

  const filteredNhaCungCaps = useMemo(() => {
    const keyword = searchNhaCungCap.trim().toLowerCase();
    return nhaCungCaps.filter((item) => {
      return (
        !keyword ||
        item.tenNCC.toLowerCase().includes(keyword) ||
        String(item.maNCC).includes(keyword) ||
        (item.soDienThoai ?? '').toLowerCase().includes(keyword) ||
        (item.email ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [nhaCungCaps, searchNhaCungCap]);

  const lowStockCount = nguyenLieus.filter((item) => item.canhBaoTonKho).length;

  const openNguyenLieuDialog = (item?: NguyenLieu) => {
    if (item) {
      setEditingNguyenLieu(item);
      setNguyenLieuForm({
        tenNL: item.tenNL,
        donViTinh: item.donViTinh,
        soLuongTon: String(item.soLuongTon),
        soLuongCanhBao: String(item.soLuongCanhBao),
        hanSuDungGanNhat: item.hanSuDungGanNhat ?? '',
        trangThai: item.trangThai,
      });
    } else {
      setEditingNguyenLieu(null);
      setNguyenLieuForm(defaultNguyenLieuForm);
    }
    setIsNguyenLieuDialogOpen(true);
  };

  const openNhaCungCapDialog = (item?: NhaCungCap) => {
    if (item) {
      setEditingNhaCungCap(item);
      setNhaCungCapForm({
        tenNCC: item.tenNCC,
        soDienThoai: item.soDienThoai ?? '',
        email: item.email ?? '',
        diaChi: item.diaChi ?? '',
        nguoiLienHe: item.nguoiLienHe ?? '',
        trangThai: item.trangThai,
      });
    } else {
      setEditingNhaCungCap(null);
      setNhaCungCapForm(defaultNhaCungCapForm);
    }
    setIsNhaCungCapDialogOpen(true);
  };

  const openAdjustDialog = (item: NguyenLieu) => {
    setAdjustingItem(item);
    setAdjustAmount('');
    setAdjustType('Nhap');
    setIsAdjustDialogOpen(true);
  };

  const handleSubmitNguyenLieu = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        tenNL: nguyenLieuForm.tenNL.trim(),
        donViTinh: nguyenLieuForm.donViTinh.trim(),
        soLuongTon: Number(nguyenLieuForm.soLuongTon),
        soLuongCanhBao: Number(nguyenLieuForm.soLuongCanhBao),
        hanSuDungGanNhat: nguyenLieuForm.hanSuDungGanNhat || null,
        trangThai: nguyenLieuForm.trangThai,
      };

      if (editingNguyenLieu) {
        await updateNguyenLieu(editingNguyenLieu.maNL, payload);
        toast.success('Cập nhật nguyên liệu thành công!');
      } else {
        await createNguyenLieu(payload);
        toast.success('Thêm nguyên liệu thành công!');
      }

      setIsNguyenLieuDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu nguyên liệu thất bại');
    }
  };

  const handleSubmitNhaCungCap = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        tenNCC: nhaCungCapForm.tenNCC.trim(),
        soDienThoai: nhaCungCapForm.soDienThoai || null,
        email: nhaCungCapForm.email || null,
        diaChi: nhaCungCapForm.diaChi || null,
        nguoiLienHe: nhaCungCapForm.nguoiLienHe || null,
        trangThai: nhaCungCapForm.trangThai,
      };

      if (editingNhaCungCap) {
        await updateNhaCungCap(editingNhaCungCap.maNCC, payload);
        toast.success('Cập nhật nhà cung cấp thành công!');
      } else {
        await createNhaCungCap(payload);
        toast.success('Thêm nhà cung cấp thành công!');
      }

      setIsNhaCungCapDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu nhà cung cấp thất bại');
    }
  };

  const handleDeleteNguyenLieu = async (item: NguyenLieu) => {
    if (!confirm(`Xóa nguyên liệu "${item.tenNL}"?`)) return;
    try {
      await deleteNguyenLieu(item.maNL);
      toast.success('Xóa nguyên liệu thành công!');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa nguyên liệu thất bại');
    }
  };

  const handleDeleteNhaCungCap = async (item: NhaCungCap) => {
    if (!confirm(`Xóa nhà cung cấp "${item.tenNCC}"?`)) return;
    try {
      await deleteNhaCungCap(item.maNCC);
      toast.success('Xóa nhà cung cấp thành công!');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa nhà cung cấp thất bại');
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem) return;
    const amount = Number(adjustAmount);
    if (!amount || amount <= 0) {
      toast.error('Số lượng điều chỉnh phải lớn hơn 0');
      return;
    }

    try {
      await dieuChinhTonKho(adjustingItem.maNL, {
        soLuong: amount,
        loaiDieuChinh: adjustType,
      });
      toast.success('Điều chỉnh tồn kho thành công!');
      setIsAdjustDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Điều chỉnh tồn kho thất bại');
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
  };

  return (
    <AdminLayout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
            <p className="text-gray-600 mt-1">CRUD nguyên liệu, nhà cung cấp và cảnh báo tồn kho</p>
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
            <Button onClick={loadData} variant="outline" disabled={loading}>
              Tải lại
            </Button>
          </div>
        </div>

        <Tabs defaultValue="nguyen-lieu" className="space-y-6">
          <TabsList>
            <TabsTrigger value="nguyen-lieu">Nguyên liệu</TabsTrigger>
            <TabsTrigger value="nha-cung-cap">Nhà cung cấp</TabsTrigger>
          </TabsList>

          <TabsContent value="nguyen-lieu" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo mã, tên hoặc đơn vị tính..."
                      value={searchNguyenLieu}
                      onChange={(e) => setSearchNguyenLieu(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                      <SelectItem value="ConHang">Còn hàng</SelectItem>
                      <SelectItem value="SapHet">Sắp hết</SelectItem>
                      <SelectItem value="HetHang">Hết hàng</SelectItem>
                      <SelectItem value="NgungSuDung">Ngừng sử dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => openNguyenLieuDialog()} className="bg-[#8B7355] hover:bg-[#6F5B44]">
                <Plus className="w-4 h-4 mr-2" />
                Thêm nguyên liệu
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Tên nguyên liệu</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead>Cảnh báo</TableHead>
                      <TableHead>Hạn gần nhất</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Số lần nhập</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNguyenLieus.map((item) => (
                      <TableRow key={item.maNL}>
                        <TableCell className="font-mono text-sm">NL{String(item.maNL).padStart(3, '0')}</TableCell>
                        <TableCell className="font-medium">{item.tenNL}</TableCell>
                        <TableCell>
                          <span className={item.canhBaoTonKho ? 'font-semibold text-red-600' : 'font-semibold'}>
                            {item.soLuongTon} {item.donViTinh}
                          </span>
                        </TableCell>
                        <TableCell>{item.soLuongCanhBao} {item.donViTinh}</TableCell>
                        <TableCell>{formatDate(item.hanSuDungGanNhat)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[item.trangThai]}>{nguyenLieuStatusLabels[item.trangThai]}</Badge>
                        </TableCell>
                        <TableCell>{item.soLanNhap}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openAdjustDialog(item)}>
                              <Package className="w-4 h-4 mr-1" />
                              Điều chỉnh
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openNguyenLieuDialog(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteNguyenLieu(item)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredNguyenLieus.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>Không tìm thấy nguyên liệu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nha-cung-cap" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo mã, tên, số điện thoại hoặc email..."
                      value={searchNhaCungCap}
                      onChange={(e) => setSearchNhaCungCap(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => openNhaCungCapDialog()} className="h-full bg-[#8B7355] hover:bg-[#6F5B44]">
                <Truck className="w-4 h-4 mr-2" />
                Thêm nhà cung cấp
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
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
                    {filteredNhaCungCaps.map((item) => (
                      <TableRow key={item.maNCC}>
                        <TableCell className="font-mono text-sm">NCC{String(item.maNCC).padStart(3, '0')}</TableCell>
                        <TableCell className="font-medium">{item.tenNCC}</TableCell>
                        <TableCell>{item.nguoiLienHe || '-'}</TableCell>
                        <TableCell>{item.soDienThoai || '-'}</TableCell>
                        <TableCell>{item.email || '-'}</TableCell>
                        <TableCell className="max-w-[220px] truncate">{item.diaChi || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[item.trangThai]}>{nhaCungCapStatusLabels[item.trangThai]}</Badge>
                        </TableCell>
                        <TableCell>{item.soPhieuNhap}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openNhaCungCapDialog(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteNhaCungCap(item)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredNhaCungCaps.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>Không tìm thấy nhà cung cấp</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isNguyenLieuDialogOpen} onOpenChange={setIsNguyenLieuDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNguyenLieu ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</DialogTitle>
              <DialogDescription>Nhập thông tin nguyên liệu trong kho.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitNguyenLieu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Tên nguyên liệu *</Label>
                  <Input
                    value={nguyenLieuForm.tenNL}
                    onChange={(e) => setNguyenLieuForm({ ...nguyenLieuForm, tenNL: e.target.value })}
                    placeholder="Sữa tươi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đơn vị tính *</Label>
                  <Input
                    value={nguyenLieuForm.donViTinh}
                    onChange={(e) => setNguyenLieuForm({ ...nguyenLieuForm, donViTinh: e.target.value })}
                    placeholder="kg, lít, gói..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select
                    value={nguyenLieuForm.trangThai}
                    onValueChange={(value: NguyenLieuStatus) => setNguyenLieuForm({ ...nguyenLieuForm, trangThai: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ConHang">Còn hàng</SelectItem>
                      <SelectItem value="SapHet">Sắp hết</SelectItem>
                      <SelectItem value="HetHang">Hết hàng</SelectItem>
                      <SelectItem value="NgungSuDung">Ngừng sử dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Số lượng tồn *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nguyenLieuForm.soLuongTon}
                    onChange={(e) => setNguyenLieuForm({ ...nguyenLieuForm, soLuongTon: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số lượng cảnh báo *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nguyenLieuForm.soLuongCanhBao}
                    onChange={(e) => setNguyenLieuForm({ ...nguyenLieuForm, soLuongCanhBao: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Hạn sử dụng gần nhất</Label>
                  <Input
                    type="date"
                    value={nguyenLieuForm.hanSuDungGanNhat}
                    onChange={(e) => setNguyenLieuForm({ ...nguyenLieuForm, hanSuDungGanNhat: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNguyenLieuDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingNguyenLieu ? 'Cập nhật' : 'Thêm nguyên liệu'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isNhaCungCapDialogOpen} onOpenChange={setIsNhaCungCapDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNhaCungCap ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
              <DialogDescription>Nhập thông tin liên hệ của nhà cung cấp.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitNhaCungCap} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Tên nhà cung cấp *</Label>
                  <Input
                    value={nhaCungCapForm.tenNCC}
                    onChange={(e) => setNhaCungCapForm({ ...nhaCungCapForm, tenNCC: e.target.value })}
                    placeholder="Công ty nguyên liệu ABC"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Người liên hệ</Label>
                  <Input
                    value={nhaCungCapForm.nguoiLienHe}
                    onChange={(e) => setNhaCungCapForm({ ...nhaCungCapForm, nguoiLienHe: e.target.value })}
                    placeholder="Anh Nam"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={nhaCungCapForm.soDienThoai}
                    onChange={(e) => setNhaCungCapForm({ ...nhaCungCapForm, soDienThoai: e.target.value })}
                    placeholder="0909123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={nhaCungCapForm.email}
                    onChange={(e) => setNhaCungCapForm({ ...nhaCungCapForm, email: e.target.value })}
                    placeholder="abc@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select
                    value={nhaCungCapForm.trangThai}
                    onValueChange={(value: NhaCungCapStatus) => setNhaCungCapForm({ ...nhaCungCapForm, trangThai: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DangHopTac">Đang hợp tác</SelectItem>
                      <SelectItem value="NgungHopTac">Ngừng hợp tác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={nhaCungCapForm.diaChi}
                    onChange={(e) => setNhaCungCapForm({ ...nhaCungCapForm, diaChi: e.target.value })}
                    placeholder="TP.HCM"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNhaCungCapDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]">
                  {editingNhaCungCap ? 'Cập nhật' : 'Thêm nhà cung cấp'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
              <DialogDescription>
                {adjustingItem && `${adjustingItem.tenNL} - hiện tại: ${adjustingItem.soLuongTon} ${adjustingItem.donViTinh}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Loại điều chỉnh</Label>
                <Select value={adjustType} onValueChange={(value: DieuChinhTonLoai) => setAdjustType(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nhap">Nhập kho (+)</SelectItem>
                    <SelectItem value="Xuat">Xuất kho (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Số lượng</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              {adjustingItem && adjustAmount && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Tồn kho sau điều chỉnh:</p>
                  <p className="text-lg font-bold text-[#8B7355]">
                    {adjustType === 'Nhap'
                      ? adjustingItem.soLuongTon + Number(adjustAmount)
                      : Math.max(0, adjustingItem.soLuongTon - Number(adjustAmount))}{' '}
                    {adjustingItem.donViTinh}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAdjustStock} className="bg-[#8B7355] hover:bg-[#6F5B44]">
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
