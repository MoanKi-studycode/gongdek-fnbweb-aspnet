import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, CalendarClock, Lock } from 'lucide-react';
import {
  getKhungCaList,
  getCaLamViecList,
  getCaDangMo,
  moCa,
  dongCa,
  getShiftStatusLabel,
  formatTimeSlot,
  type KhungCa,
  type CaLamViec,
} from '@/services/shiftService';
import { getEmployees, type Employee } from '@/services/employeeService';
import { toast } from 'sonner';

export function ShiftsPage() {
  const [khungCas, setKhungCas] = useState<KhungCa[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<CaLamViec[]>([]);
  const [openShifts, setOpenShifts] = useState<CaLamViec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterTuNgay, setFilterTuNgay] = useState('');
  const [filterDenNgay, setFilterDenNgay] = useState('');
  const [filterMaNV, setFilterMaNV] = useState('all');
  const [filterMaKhungCa, setFilterMaKhungCa] = useState('all');
  const [filterTrangThai, setFilterTrangThai] = useState('all');

  const [isMoCaOpen, setIsMoCaOpen] = useState(false);
  const [isDongCaOpen, setIsDongCaOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<CaLamViec | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [moCaForm, setMoCaForm] = useState({
    maKhungCa: '',
    maNV: '',
    tienQuyDauCa: '0',
    ghiChu: '',
  });

  const [dongCaForm, setDongCaForm] = useState({
    tienMatThucTe: '',
    ghiChu: '',
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('vi-VN');

  // Tải dữ liệu khung ca, nhân viên và ca làm việc
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [khungCaList, employeeList, openList, historyList] = await Promise.all([
        getKhungCaList(),
        getEmployees({ maVaiTro: undefined }),
        getCaDangMo(),
        getCaLamViecList({
          tuNgay: filterTuNgay || undefined,
          denNgay: filterDenNgay || undefined,
          maNV: filterMaNV !== 'all' ? Number(filterMaNV) : undefined,
          maKhungCa: filterMaKhungCa !== 'all' ? Number(filterMaKhungCa) : undefined,
          trangThaiCa:
            filterTrangThai !== 'all'
              ? (filterTrangThai as 'DangMo' | 'DaDong')
              : undefined,
        }),
      ]);

      setKhungCas(khungCaList);
      setEmployees(employeeList.filter((e) => e.trangThai === 'HoatDong'));
      setOpenShifts(openList);
      setHistory(historyList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu ca làm việc.');
    } finally {
      setLoading(false);
    }
  }, [filterTuNgay, filterDenNgay, filterMaNV, filterMaKhungCa, filterTrangThai]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenMoCa = () => {
    setMoCaForm({
      maKhungCa: khungCas[0] ? String(khungCas[0].maKhungCa) : '',
      maNV: employees[0] ? String(employees[0].maNV) : '',
      tienQuyDauCa: '0',
      ghiChu: '',
    });
    setIsMoCaOpen(true);
  };

  const handleSubmitMoCa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await moCa({
        maKhungCa: Number(moCaForm.maKhungCa),
        maNV: Number(moCaForm.maNV),
        tienQuyDauCa: Number(moCaForm.tienQuyDauCa),
        ghiChu: moCaForm.ghiChu || undefined,
      });
      toast.success('Mở ca thành công!');
      setIsMoCaOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể mở ca.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDongCa = (shift: CaLamViec) => {
    setSelectedShift(shift);
    setDongCaForm({ tienMatThucTe: String(shift.tienQuyDauCa), ghiChu: '' });
    setIsDongCaOpen(true);
  };

  const handleSubmitDongCa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift) return;

    setSubmitting(true);
    try {
      await dongCa(selectedShift.maCa, {
        tienMatThucTe: Number(dongCaForm.tienMatThucTe),
        ghiChu: dongCaForm.ghiChu || undefined,
      });
      toast.success('Đóng ca thành công!');
      setIsDongCaOpen(false);
      setSelectedShift(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể đóng ca.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: CaLamViec['trangThaiCa']) =>
    status === 'DangMo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

  const renderShiftTable = (rows: CaLamViec[], showCloseAction = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã ca</TableHead>
          <TableHead>Khung ca</TableHead>
          <TableHead>Nhân viên</TableHead>
          <TableHead>Ngày làm</TableHead>
          <TableHead>Thời gian mở</TableHead>
          <TableHead>Thời gian đóng</TableHead>
          <TableHead>Quỹ đầu ca</TableHead>
          <TableHead>Tiền thực tế</TableHead>
          <TableHead>Trạng thái</TableHead>
          {showCloseAction && <TableHead className="text-right">Thao tác</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((shift) => (
          <TableRow key={shift.maCa}>
            <TableCell className="font-mono font-semibold">CA{String(shift.maCa).padStart(3, '0')}</TableCell>
            <TableCell>{shift.tenCa}</TableCell>
            <TableCell>{shift.hoTenNV}</TableCell>
            <TableCell>{formatDate(shift.ngayLam)}</TableCell>
            <TableCell className="text-sm">{formatDateTime(shift.thoiGianMo)}</TableCell>
            <TableCell className="text-sm">
              {shift.thoiGianDong ? formatDateTime(shift.thoiGianDong) : '—'}
            </TableCell>
            <TableCell>{formatPrice(shift.tienQuyDauCa)}</TableCell>
            <TableCell>
              {shift.tienMatThucTe != null ? formatPrice(shift.tienMatThucTe) : '—'}
            </TableCell>
            <TableCell>
              <Badge className={getStatusBadgeClass(shift.trangThaiCa)}>
                {getShiftStatusLabel(shift.trangThaiCa)}
              </Badge>
            </TableCell>
            {showCloseAction && (
              <TableCell className="text-right">
                {shift.trangThaiCa === 'DangMo' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDongCa(shift)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Đóng ca
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý ca làm việc</h1>
            <p className="text-gray-600 mt-1">Mở ca, đóng ca và xem lịch sử làm việc</p>
          </div>
          <div className="flex items-center gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-[#8B7355]" />
                  <div>
                    <p className="text-sm text-gray-600">Ca đang mở</p>
                    <p className="text-2xl font-bold text-gray-900">{openShifts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleOpenMoCa}
              className="bg-[#8B7355] hover:bg-[#6F5B44]"
              disabled={khungCas.length === 0 || employees.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Mở ca
            </Button>
          </div>
        </div>

        {/* Khung ca tham chiếu */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Khung ca hệ thống</p>
            <div className="flex flex-wrap gap-3">
              {khungCas.map((kc) => (
                <Badge key={kc.maKhungCa} variant="outline" className="px-3 py-1.5 text-sm">
                  {kc.tenCa}: {formatTimeSlot(kc.gioBatDau, kc.gioKetThuc)}
                </Badge>
              ))}
              {khungCas.length === 0 && (
                <span className="text-sm text-gray-400">Chưa có khung ca</span>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={loadData}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="open">
            <TabsList className="mb-6">
              <TabsTrigger value="open">Ca đang mở ({openShifts.length})</TabsTrigger>
              <TabsTrigger value="history">Lịch sử ca</TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              <Card>
                <CardContent className="p-6">
                  {openShifts.length > 0 ? (
                    renderShiftTable(openShifts, true)
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>Hiện không có ca nào đang mở</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <Label>Từ ngày</Label>
                      <Input type="date" value={filterTuNgay} onChange={(e) => setFilterTuNgay(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Đến ngày</Label>
                      <Input type="date" value={filterDenNgay} onChange={(e) => setFilterDenNgay(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Nhân viên</Label>
                      <Select value={filterMaNV} onValueChange={setFilterMaNV}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {employees.map((emp) => (
                            <SelectItem key={emp.maNV} value={String(emp.maNV)}>
                              {emp.hoTen}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Khung ca</Label>
                      <Select value={filterMaKhungCa} onValueChange={setFilterMaKhungCa}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {khungCas.map((kc) => (
                            <SelectItem key={kc.maKhungCa} value={String(kc.maKhungCa)}>
                              {kc.tenCa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Trạng thái</Label>
                      <Select value={filterTrangThai} onValueChange={setFilterTrangThai}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="DangMo">Đang mở</SelectItem>
                          <SelectItem value="DaDong">Đã đóng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  {history.length > 0 ? (
                    renderShiftTable(history, true)
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>Không có dữ liệu ca làm việc</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Dialog mở ca */}
        <Dialog open={isMoCaOpen} onOpenChange={setIsMoCaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mở ca làm việc</DialogTitle>
              <DialogDescription>Chọn nhân viên, khung ca và nhập tiền quỹ đầu ca</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitMoCa} className="space-y-4">
              <div className="space-y-2">
                <Label>Khung ca *</Label>
                <Select
                  value={moCaForm.maKhungCa}
                  onValueChange={(v) => setMoCaForm({ ...moCaForm, maKhungCa: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khung ca" />
                  </SelectTrigger>
                  <SelectContent>
                    {khungCas.map((kc) => (
                      <SelectItem key={kc.maKhungCa} value={String(kc.maKhungCa)}>
                        {kc.tenCa} ({formatTimeSlot(kc.gioBatDau, kc.gioKetThuc)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nhân viên *</Label>
                <Select
                  value={moCaForm.maNV}
                  onValueChange={(v) => setMoCaForm({ ...moCaForm, maNV: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.maNV} value={String(emp.maNV)}>
                        {emp.hoTen} ({emp.tenDangNhap})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tienQuyDauCa">Tiền quỹ đầu ca (VNĐ) *</Label>
                <Input
                  id="tienQuyDauCa"
                  type="number"
                  min={0}
                  value={moCaForm.tienQuyDauCa}
                  onChange={(e) => setMoCaForm({ ...moCaForm, tienQuyDauCa: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ghiChuMoCa">Ghi chú</Label>
                <Textarea
                  id="ghiChuMoCa"
                  value={moCaForm.ghiChu}
                  onChange={(e) => setMoCaForm({ ...moCaForm, ghiChu: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsMoCaOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#8B7355] hover:bg-[#6F5B44]" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : 'Mở ca'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog đóng ca */}
        <Dialog open={isDongCaOpen} onOpenChange={setIsDongCaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đóng ca làm việc</DialogTitle>
              <DialogDescription>
                {selectedShift
                  ? `${selectedShift.tenCa} — ${selectedShift.hoTenNV}`
                  : 'Nhập tiền mặt thực tế khi đóng ca'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitDongCa} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tienMatThucTe">Tiền mặt thực tế (VNĐ) *</Label>
                <Input
                  id="tienMatThucTe"
                  type="number"
                  min={0}
                  value={dongCaForm.tienMatThucTe}
                  onChange={(e) => setDongCaForm({ ...dongCaForm, tienMatThucTe: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ghiChuDongCa">Ghi chú</Label>
                <Textarea
                  id="ghiChuDongCa"
                  value={dongCaForm.ghiChu}
                  onChange={(e) => setDongCaForm({ ...dongCaForm, ghiChu: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDongCaOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="destructive" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : 'Đóng ca'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
