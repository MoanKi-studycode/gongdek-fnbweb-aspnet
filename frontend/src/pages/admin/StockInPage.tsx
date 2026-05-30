import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Eye, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { deleteConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';
import { toast } from 'sonner';
import {
  approvePhieuNhapKho,
  cancelPhieuNhapKho,
  createPhieuNhapKho,
  deletePhieuNhapKho,
  getNguyenLieus,
  getNhaCungCaps,
  getPhieuNhapKhos,
  getStockInStatusColor,
  getStockInStatusLabel,
  mapPhieuNhapToStockIn,
  type CreateChiTietPhieuNhapInput,
  type NguyenLieu,
  type NhaCungCap,
  type PhieuNhapKhoApi,
  type PhieuNhapTrangThai,
} from '@/services/inventoryService';
import type { StockIn, StockInStatus } from '@/types';

type StockInFilter = 'ALL' | PhieuNhapTrangThai;

interface StockInFormItem {
  maNL: string;
  soLuongNhap: string;
  donGiaNhap: string;
  hanSuDung: string;
}

const initialItem: StockInFormItem = {
  maNL: '',
  soLuongNhap: '1',
  donGiaNhap: '0',
  hanSuDung: '',
};

const statusApiToUi: Record<StockInFilter, StockInStatus | 'ALL'> = {
  ALL: 'ALL',
  ChoDuyet: 'CHO_DUYET',
  DaDuyet: 'DA_DUYET',
  HoanThanh: 'HOAN_THANH',
  Huy: 'HUY',
};

export function StockInPage() {
  const { confirm } = useConfirm();
  const [records, setRecords] = useState<PhieuNhapKhoApi[]>([]);
  const [suppliers, setSuppliers] = useState<NhaCungCap[]>([]);
  const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StockInFilter>('ALL');
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [maNCC, setMaNCC] = useState('');
  const [ngayNhap, setNgayNhap] = useState(new Date().toISOString().slice(0, 10));
  const [ghiChu, setGhiChu] = useState('');
  const [items, setItems] = useState<StockInFormItem[]>([{ ...initialItem }]);

  const stockIns = useMemo(() => records.map(mapPhieuNhapToStockIn), [records]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [stockInData, supplierData, ingredientData] = await Promise.all([
        getPhieuNhapKhos(),
        getNhaCungCaps(),
        getNguyenLieus(),
      ]);
      setRecords(stockInData);
      setSuppliers(supplierData);
      setIngredients(ingredientData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu nhập kho');
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const filteredStockIns = useMemo(() => {
    const uiStatus = statusApiToUi[selectedStatus];
    if (uiStatus === 'ALL') return stockIns;
    return stockIns.filter((item) => item.status === uiStatus);
  }, [selectedStatus, stockIns]);

  const getStockInCount = (status: StockInFilter) => {
    const uiStatus = statusApiToUi[status];
    if (uiStatus === 'ALL') return stockIns.length;
    return stockIns.filter((item) => item.status === uiStatus).length;
  };

  const calculateRowTotal = (item: StockInFormItem) => {
    const quantity = Number(item.soLuongNhap) || 0;
    const price = Number(item.donGiaNhap) || 0;
    return quantity * price;
  };

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + calculateRowTotal(item), 0), [items]);

  const resetForm = () => {
    setMaNCC('');
    setNgayNhap(new Date().toISOString().slice(0, 10));
    setGhiChu('');
    setItems([{ ...initialItem }]);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleChangeItem = (index: number, field: keyof StockInFormItem, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    setItems((current) => [...current, { ...initialItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleSubmit = async () => {
    const supplierId = Number(maNCC);
    if (!supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return;
    }

    const details: CreateChiTietPhieuNhapInput[] = [];
    for (const item of items) {
      const maNL = Number(item.maNL);
      const soLuongNhap = Number(item.soLuongNhap);
      const donGiaNhap = Number(item.donGiaNhap);

      if (!maNL) {
        toast.error('Vui lòng chọn nguyên liệu');
        return;
      }
      if (!soLuongNhap || soLuongNhap <= 0) {
        toast.error('Số lượng nhập phải lớn hơn 0');
        return;
      }
      if (Number.isNaN(donGiaNhap) || donGiaNhap < 0) {
        toast.error('Đơn giá nhập không được âm');
        return;
      }

      details.push({
        maNL,
        soLuongNhap,
        donGiaNhap,
        hanSuDung: item.hanSuDung || null,
      });
    }

    const duplicated = details.some((detail, index) => details.findIndex((item) => item.maNL === detail.maNL) !== index);
    if (duplicated) {
      toast.error('Một nguyên liệu không được nhập lặp lại trong cùng phiếu');
      return;
    }

    try {
      await createPhieuNhapKho({
        maNCC: supplierId,
        ngayNhap: ngayNhap || null,
        ghiChu: ghiChu.trim() || null,
        chiTiet: details,
      });
      toast.success('Lập phiếu nhập kho thành công');
      setIsCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không lập được phiếu nhập kho');
    }
  };

  const handleViewDetail = (stockIn: StockIn) => {
    setSelectedStockIn(stockIn);
    setIsDetailOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedStockIn) return;
    const ok = await confirm({
      title: 'Xác nhận hủy phiếu nhập',
      message: 'Bạn có chắc muốn hủy phiếu nhập này?',
      confirmText: 'Hủy phiếu',
      cancelText: 'Quay lại',
      variant: 'warning',
    });
    if (!ok) return;

    try {
      await cancelPhieuNhapKho(Number(selectedStockIn.id), selectedStockIn.notes || undefined);
      notifySuccess('Đã hủy phiếu nhập kho.');
      setIsDetailOpen(false);
      await loadData();
    } catch (error) {
      notifyError(error, 'Không hủy được phiếu nhập kho');
    }
  };

  const handleApprove = async () => {
    if (!selectedStockIn) return;
    const ok = await confirm({
      title: 'Xác nhận duyệt phiếu nhập',
      message: 'Duyệt phiếu nhập này? Số lượng nguyên liệu sẽ được cộng vào tồn kho.',
      confirmText: 'Duyệt',
      cancelText: 'Hủy',
      variant: 'success',
    });
    if (!ok) return;

    try {
      await approvePhieuNhapKho(Number(selectedStockIn.id), selectedStockIn.notes || undefined);
      notifySuccess('Đã duyệt phiếu nhập và cập nhật tồn kho.');
      setIsDetailOpen(false);
      await loadData();
    } catch (error) {
      notifyError(error, 'Không duyệt được phiếu nhập kho');
    }
  };

  const handleQuickApprove = async (stockIn: StockIn) => {
    const ok = await confirm({
      title: 'Xác nhận duyệt phiếu nhập',
      message: `Duyệt phiếu nhập #${stockIn.code}? Số lượng nguyên liệu sẽ được cộng vào tồn kho.`,
      confirmText: 'Duyệt',
      cancelText: 'Hủy',
      variant: 'success',
    });
    if (!ok) return;

    try {
      await approvePhieuNhapKho(Number(stockIn.id), stockIn.notes || undefined);
      notifySuccess('Đã duyệt phiếu nhập và cập nhật tồn kho.');
      await loadData();
    } catch (error) {
      notifyError(error, 'Không duyệt được phiếu nhập kho');
    }
  };

  const handleDelete = async (stockIn: StockIn) => {
    const ok = await confirm(
      deleteConfirmOptions('phiếu nhập', `Bạn có chắc muốn xóa phiếu nhập #${stockIn.code}?`),
    );
    if (!ok) return;
    try {
      await deletePhieuNhapKho(Number(stockIn.id));
      notifySuccess(toastMessages.deleteSuccess);
      await loadData();
    } catch (error) {
      notifyError(error, 'Không xóa được phiếu nhập kho');
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhập kho</h1>
            <p className="mt-1 text-gray-600">Lập phiếu nhập kho và quản lý trạng thái phiếu nhập</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            <Button onClick={handleOpenCreate} className="bg-[#8B7355] hover:bg-[#6F5B44]">
              <Plus className="mr-2 h-4 w-4" />
              Lập phiếu nhập
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {([
            ['ALL', 'Tất cả'],
            ['ChoDuyet', 'Chờ duyệt'],
            ['DaDuyet', 'Đã duyệt'],
            ['HoanThanh', 'Hoàn thành'],
            ['Huy', 'Đã hủy'],
          ] as [StockInFilter, string][]).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedStatus === status ? 'border-[#8B7355] bg-[#8B7355]/10' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{getStockInCount(status)}</p>
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {filteredStockIns.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p>Không có phiếu nhập kho nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã PN</TableHead>
                      <TableHead>Nhà cung cấp</TableHead>
                      <TableHead>Số mặt hàng</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Người lập</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày nhập</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockIns.map((stockIn) => (
                      <TableRow key={stockIn.id}>
                        <TableCell className="font-mono font-semibold">#{stockIn.code}</TableCell>
                        <TableCell>{stockIn.supplierName}</TableCell>
                        <TableCell>{stockIn.items.length} mặt hàng</TableCell>
                        <TableCell className="font-semibold text-[#8B7355]">{formatPrice(stockIn.totalAmount)}</TableCell>
                        <TableCell className="text-gray-600">{stockIn.createdBy}</TableCell>
                        <TableCell>
                          <Badge className={getStockInStatusColor(stockIn.status)}>
                            {getStockInStatusLabel(stockIn.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(stockIn.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(stockIn)}>
                              <Eye className="mr-1 h-4 w-4" />
                              Chi tiết
                            </Button>
                            {stockIn.status === 'CHO_DUYET' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-700 hover:text-green-800"
                                onClick={() => handleQuickApprove(stockIn)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Duyệt
                              </Button>
                            )}
                            {(stockIn.status === 'CHO_DUYET' || stockIn.status === 'HUY') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(stockIn)}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Xóa
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-h-[90vh] w-[95vw] max-w-6xl overflow-y-auto p-0">
            <div className="p-4 md:p-6">
              <DialogHeader>
                <DialogTitle>Lập phiếu nhập kho</DialogTitle>
                <DialogDescription>Phiếu mới sẽ ở trạng thái chờ duyệt, chưa cộng vào tồn kho.</DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nhà cung cấp</Label>
                    <Select value={maNCC} onValueChange={setMaNCC}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn nhà cung cấp" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.maNCC} value={String(supplier.maNCC)}>
                            {supplier.tenNCC}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày nhập</Label>
                    <Input type="date" value={ngayNhap} onChange={(event) => setNgayNhap(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold">Chi tiết nguyên liệu nhập</h3>
                    <Button type="button" variant="outline" onClick={handleAddItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm dòng
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const ingredient = ingredients.find((nl) => String(nl.maNL) === item.maNL);
                      return (
                        <Card key={index} className="border-dashed">
                          <CardContent className="p-4 md:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">Nguyên liệu #{index + 1}</p>
                                <p className="text-sm text-gray-500">Chọn nguyên liệu, số lượng và đơn giá nhập.</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa dòng
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
                              <div className="min-w-0 space-y-2 xl:col-span-4">
                                <Label>Nguyên liệu</Label>
                                <Select value={item.maNL} onValueChange={(value) => handleChangeItem(index, 'maNL', value)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn nguyên liệu" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ingredients.map((nl) => (
                                      <SelectItem key={nl.maNL} value={String(nl.maNL)}>
                                        {nl.tenNL} ({nl.donViTinh})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2 xl:col-span-2">
                                <Label>Số lượng</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.soLuongNhap}
                                  onChange={(event) => handleChangeItem(index, 'soLuongNhap', event.target.value)}
                                />
                              </div>

                              <div className="space-y-2 xl:col-span-2">
                                <Label>Đơn vị</Label>
                                <Input value={ingredient?.donViTinh ?? ''} disabled placeholder="Đơn vị" />
                              </div>

                              <div className="space-y-2 xl:col-span-2">
                                <Label>Đơn giá</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  value={item.donGiaNhap}
                                  onChange={(event) => handleChangeItem(index, 'donGiaNhap', event.target.value)}
                                />
                              </div>

                              <div className="space-y-2 xl:col-span-2">
                                <Label>Hạn sử dụng</Label>
                                <Input
                                  type="date"
                                  value={item.hanSuDung}
                                  onChange={(event) => handleChangeItem(index, 'hanSuDung', event.target.value)}
                                />
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[#8B7355]/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-600">Thành tiền tạm tính</span>
                              <span className="text-base font-semibold text-[#8B7355]">{formatPrice(calculateRowTotal(item))}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea value={ghiChu} onChange={(event) => setGhiChu(event.target.value)} placeholder="Ghi chú cho phiếu nhập" />
                </div>

                <Card>
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-lg font-semibold">Tổng tiền nhập</span>
                    <span className="text-2xl font-bold text-[#8B7355]">{formatPrice(totalAmount)}</span>
                  </CardContent>
                </Card>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit} className="bg-[#8B7355] hover:bg-[#6F5B44]">
                    Lưu phiếu nhập
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu nhập #{selectedStockIn?.code}</DialogTitle>
              <DialogDescription>{selectedStockIn && `Ngày nhập: ${formatDate(selectedStockIn.createdAt)}`}</DialogDescription>
            </DialogHeader>

            {selectedStockIn && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600">Nhà cung cấp</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{selectedStockIn.supplierName}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-600">Người lập</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{selectedStockIn.createdBy}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Danh sách nguyên liệu</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {selectedStockIn.items.map((item, index) => (
                          <div key={index} className="flex justify-between border-b pb-3 last:border-b-0">
                            <div className="flex-1">
                              <p className="font-medium">{item.inventoryName}</p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.unitPrice)} / {item.unit}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-sm text-gray-600">
                                x{item.quantity} {item.unit}
                              </p>
                              <p className="font-semibold text-[#8B7355]">{formatPrice(item.totalPrice)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng tiền:</span>
                      <span className="text-[#8B7355]">{formatPrice(selectedStockIn.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Trạng thái:</span>
                      <Badge className={getStockInStatusColor(selectedStockIn.status)}>
                        {getStockInStatusLabel(selectedStockIn.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {selectedStockIn.notes && (
                  <div className="rounded-md bg-yellow-50 p-3">
                    <p className="text-sm font-semibold text-yellow-800">Ghi chú:</p>
                    <p className="text-sm text-yellow-700">{selectedStockIn.notes}</p>
                  </div>
                )}

                <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>

                  {selectedStockIn.status === 'CHO_DUYET' && (
                    <>
                      <Button onClick={handleApprove} className="bg-green-700 hover:bg-green-800">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Duyệt và cập nhật tồn kho
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="text-red-600 hover:text-red-700">
                        <XCircle className="mr-2 h-4 w-4" />
                        Hủy phiếu
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
