import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
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
import { Plus, Clock, CalendarClock, Lock, AlertTriangle } from 'lucide-react';
import {
  getKhungCaList,
  getCaLamViecList,
  getCaDangMo,
  moCa,
  dongCa,
  getDongCaTomTat,
  getKhungCaTimeWarning,
  getShiftStatusLabel,
  formatTimeSlot,
  type KhungCa,
  type CaLamViec,
  type DongCaTomTat,
} from '@/services/shiftService';
import { getEmployees, type Employee } from '@/services/employeeService';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';

type ShiftsPageProps = {
  employeeMode?: boolean;
};

export function ShiftsPage({ employeeMode = false }: ShiftsPageProps) {
  const { user, hasRole } = useAuth();
  const staffOnly = employeeMode || (user != null && !hasRole('QuanLy'));
  const staffId = user ? Number(user.id) : undefined;

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
  const [dongCaSummary, setDongCaSummary] = useState<DongCaTomTat | null>(null);
  const [dongCaSummaryLoading, setDongCaSummaryLoading] = useState(false);

  const hasOwnOpenShift = staffOnly && openShifts.length > 0;

  const moCaTimeWarning = useMemo(() => {
    if (!moCaForm.maKhungCa) return null;
    const khungCa = khungCas.find((kc) => String(kc.maKhungCa) === moCaForm.maKhungCa);
    return khungCa ? getKhungCaTimeWarning(khungCa) : null;
  }, [khungCas, moCaForm.maKhungCa]);

  const dongCaChenhLech = useMemo(() => {
    if (!dongCaSummary) return null;
    const thucTe = Number(dongCaForm.tienMatThucTe);
    if (Number.isNaN(thucTe)) return null;
    return thucTe - dongCaSummary.tienMatKyVong;
  }, [dongCaSummary, dongCaForm.tienMatThucTe]);

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
      const historyMaNv = staffOnly
        ? staffId
        : filterMaNV !== 'all'
          ? Number(filterMaNV)
          : undefined;

      const [khungCaList, openList, historyList] = await Promise.all([
        getKhungCaList(),
        getCaDangMo(),
        getCaLamViecList({
          tuNgay: filterTuNgay || undefined,
          denNgay: filterDenNgay || undefined,
          maNV: historyMaNv,
          maKhungCa: filterMaKhungCa !== 'all' ? Number(filterMaKhungCa) : undefined,
          trangThaiCa:
            filterTrangThai !== 'all'
              ? (filterTrangThai as 'DangMo' | 'DaDong')
              : undefined,
        }),
      ]);

      let employeeList: Employee[] = [];
      if (!staffOnly) {
        employeeList = (await getEmployees({ maVaiTro: undefined })).filter(
          (e) => e.trangThai === 'HoatDong',
        );
      }

      setKhungCas(khungCaList);
      setEmployees(employeeList);
      setOpenShifts(openList);
      setHistory(historyList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu ca làm việc.');
    } finally {
      setLoading(false);
    }
  }, [filterTuNgay, filterDenNgay, filterMaNV, filterMaKhungCa, filterTrangThai, staffOnly, staffId]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenMoCa = () => {
    setMoCaForm({
      maKhungCa: khungCas[0] ? String(khungCas[0].maKhungCa) : '',
      maNV: staffOnly && staffId ? String(staffId) : employees[0] ? String(employees[0].maNV) : '',
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
        maNV: staffOnly && staffId ? staffId : Number(moCaForm.maNV),
        tienQuyDauCa: Number(moCaForm.tienQuyDauCa),
        ghiChu: moCaForm.ghiChu || undefined,
      });
      notifySuccess(toastMessages.openShiftSuccess);
      setIsMoCaOpen(false);
      await loadData();
    } catch (err) {
      notifyError(err, 'Không thể mở ca.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDongCa = async (shift: CaLamViec) => {
    setSelectedShift(shift);
    setDongCaForm({ tienMatThucTe: String(shift.tienQuyDauCa), ghiChu: '' });
    setDongCaSummary(null);
    setIsDongCaOpen(true);
    setDongCaSummaryLoading(true);
    try {
      const summary = await getDongCaTomTat(shift.maCa);
      setDongCaSummary(summary);
      setDongCaForm({
        tienMatThucTe: String(summary.tienMatKyVong),
        ghiChu: '',
      });
    } catch (err) {
      notifyError(err, 'Không thể tải tóm tắt đóng ca.');
      setDongCaForm({ tienMatThucTe: String(shift.tienQuyDauCa), ghiChu: '' });
    } finally {
      setDongCaSummaryLoading(false);
    }
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
      notifySuccess(toastMessages.closeShiftSuccess);
      setIsDongCaOpen(false);
      setSelectedShift(null);
      await loadData();
    } catch (err) {
      notifyError(err, 'Không thể đóng ca.');
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

  const pageContent = (
      <div className={staffOnly ? 'max-w-6xl mx-auto px-4 py-8' : 'p-8'}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {staffOnly ? 'Ca làm việc của tôi' : 'Quản lý ca làm việc'}
            </h1>
            <p className="text-gray-600 mt-1">
              {staffOnly ? 'Mở ca trước khi bán hàng tại quầy (POS)' : 'Mở ca, đóng ca và xem lịch sử làm việc'}
            </p>
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
              disabled={
                khungCas.length === 0 ||
                (!staffOnly && employees.length === 0) ||
                hasOwnOpenShift
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Mở ca
            </Button>
          </div>
        </div>

        {hasOwnOpenShift && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Bạn đang có ca mở. Vui lòng <strong>đóng ca</strong> trước khi mở ca mới.
          </div>
        )}

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
                    {!staffOnly && (
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
                    )}
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
              <DialogDescription>
                {staffOnly
                  ? 'Chọn khung ca và nhập tiền quỹ đầu ca'
                  : 'Chọn nhân viên, khung ca và nhập tiền quỹ đầu ca'}
              </DialogDescription>
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
              {!staffOnly && (
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
              )}
              {moCaTimeWarning && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{moCaTimeWarning}</span>
                </div>
              )}
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
        <Dialog open={isDongCaOpen} onOpenChange={(open) => {
          setIsDongCaOpen(open);
          if (!open) {
            setSelectedShift(null);
            setDongCaSummary(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đóng ca làm việc</DialogTitle>
              <DialogDescription>
                {selectedShift
                  ? `${selectedShift.tenCa} — ${selectedShift.hoTenNV}`
                  : 'Nhập tiền mặt thực tế khi đóng ca'}
              </DialogDescription>
            </DialogHeader>
            {dongCaSummaryLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
            <form onSubmit={handleSubmitDongCa} className="space-y-4">
              {dongCaSummary && (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#FAF8F3] p-4 text-sm">
                  <div>
                    <p className="text-gray-600">Quỹ đầu ca</p>
                    <p className="font-semibold">{formatPrice(dongCaSummary.tienQuyDauCa)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Doanh thu tiền mặt</p>
                    <p className="font-semibold">{formatPrice(dongCaSummary.tongTienMatTrongCa)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hóa đơn tiền mặt</p>
                    <p className="font-semibold">
                      {dongCaSummary.soHoaDonTienMat} / {dongCaSummary.tongSoHoaDon} đơn
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tiền mặt kỳ vọng</p>
                    <p className="font-semibold text-[#8B7355]">{formatPrice(dongCaSummary.tienMatKyVong)}</p>
                  </div>
                </div>
              )}
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
                {dongCaChenhLech != null && dongCaSummary && (
                  <p
                    className={`text-sm ${
                      dongCaChenhLech === 0
                        ? 'text-green-700'
                        : Math.abs(dongCaChenhLech) <= 10000
                          ? 'text-amber-700'
                          : 'text-red-600'
                    }`}
                  >
                    Chênh lệch so với kỳ vọng:{' '}
                    {dongCaChenhLech === 0
                      ? 'Khớp'
                      : `${dongCaChenhLech > 0 ? '+' : ''}${formatPrice(dongCaChenhLech)}`}
                  </p>
                )}
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
            )}
          </DialogContent>
        </Dialog>
      </div>
  );

  if (staffOnly) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/employee/pos" className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="font-semibold text-gray-900">GongDek POS</span>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/employee/pos">Quầy bán</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/employee/orders-online">Đơn online</Link>
              </Button>
            </div>
          </div>
        </header>
        {pageContent}
      </div>
    );
  }

  return <AdminLayout>{pageContent}</AdminLayout>;
}
