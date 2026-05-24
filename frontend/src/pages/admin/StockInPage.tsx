import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ModuleNotice } from '@/components/common/ModuleNotice';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import {
  getStockInRecords,
  getStockInStatusLabel,
  getStockInStatusColor,
} from '@/services/inventoryService';
import type { StockIn, StockInStatus } from '@/types';
import { toast } from 'sonner';

export function StockInPage() {
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StockInStatus | 'ALL'>('ALL');
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getStockInRecords().then(setStockIns);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  const getFilteredStockIns = () => {
    if (selectedStatus === 'ALL') return stockIns;
    return stockIns.filter((si) => si.status === selectedStatus);
  };

  const getStockInCount = (status: StockInStatus | 'ALL') => {
    if (status === 'ALL') return stockIns.length;
    return stockIns.filter((si) => si.status === status).length;
  };

  const handleViewDetail = (stockIn: StockIn) => {
    setSelectedStockIn(stockIn);
    setIsDetailOpen(true);
  };

  const handleApprove = () => {
    if (!selectedStockIn) return;

    setStockIns(
      stockIns.map((si) =>
        si.id === selectedStockIn.id
          ? {
              ...si,
              status: 'DA_DUYET',
              approvedBy: 'Admin',
              approvedAt: new Date().toISOString(),
            }
          : si
      )
    );

    toast.success('Duyệt phiếu nhập kho thành công!');
    setIsDetailOpen(false);
  };

  const handleComplete = () => {
    if (!selectedStockIn) return;

    setStockIns(
      stockIns.map((si) =>
        si.id === selectedStockIn.id
          ? {
              ...si,
              status: 'HOAN_THANH',
            }
          : si
      )
    );

    toast.success('Hoàn thành nhập kho!');
    setIsDetailOpen(false);
  };

  const handleCancel = () => {
    if (!selectedStockIn) return;

    if (confirm('Bạn có chắc muốn hủy phiếu nhập này?')) {
      setStockIns(
        stockIns.map((si) =>
          si.id === selectedStockIn.id
            ? {
                ...si,
                status: 'HUY',
              }
            : si
        )
      );

      toast.success('Đã hủy phiếu nhập kho');
      setIsDetailOpen(false);
    }
  };

  const filteredStockIns = getFilteredStockIns();

  return (
    <AdminLayout>
      <div className="p-8">
        <ModuleNotice owner="Trần Quốc Tiên" module="quản lý nhập kho" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhập kho</h1>
          <p className="text-gray-600 mt-1">Quản lý phiếu nhập kho và nhà cung cấp</p>
        </div>

        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="ALL">Tất cả ({getStockInCount('ALL')})</TabsTrigger>
            <TabsTrigger value="CHO_DUYET">
              Chờ duyệt ({getStockInCount('CHO_DUYET')})
            </TabsTrigger>
            <TabsTrigger value="DA_DUYET">
              Đã duyệt ({getStockInCount('DA_DUYET')})
            </TabsTrigger>
            <TabsTrigger value="HOAN_THANH">
              Hoàn thành ({getStockInCount('HOAN_THANH')})
            </TabsTrigger>
            <TabsTrigger value="HUY">Đã hủy ({getStockInCount('HUY')})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            <Card>
              <CardContent className="p-6">
                {filteredStockIns.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Không có phiếu nhập kho nào</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã PN</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Số mặt hàng</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Người tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockIns.map((stockIn) => (
                        <TableRow key={stockIn.id}>
                          <TableCell className="font-mono font-semibold">
                            #{stockIn.code}
                          </TableCell>
                          <TableCell>{stockIn.supplierName}</TableCell>
                          <TableCell>{stockIn.items.length} mặt hàng</TableCell>
                          <TableCell className="font-semibold text-[#8B7355]">
                            {formatPrice(stockIn.totalAmount)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {stockIn.createdBy}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStockInStatusColor(stockIn.status)}>
                              {getStockInStatusLabel(stockIn.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDateTime(stockIn.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(stockIn)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu nhập #{selectedStockIn?.code}</DialogTitle>
              <DialogDescription>
                Tạo lúc: {selectedStockIn && formatDateTime(selectedStockIn.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedStockIn && (
              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div>
                        <p className="text-sm text-gray-600">Nhà cung cấp</p>
                        <p className="font-semibold">{selectedStockIn.supplierName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div>
                        <p className="text-sm text-gray-600">Người tạo</p>
                        <p className="font-semibold">{selectedStockIn.createdBy}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedStockIn.approvedBy && (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <div>
                            <p className="text-sm text-gray-600">Người duyệt</p>
                            <p className="font-semibold">{selectedStockIn.approvedBy}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div>
                            <p className="text-sm text-gray-600">Thời gian duyệt</p>
                            <p className="font-semibold">
                              {formatDateTime(selectedStockIn.approvedAt!)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Danh sách vật tư</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {selectedStockIn.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between pb-3 border-b last:border-b-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.inventoryName}</p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.unitPrice)} / {item.unit}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-gray-600">
                                x{item.quantity} {item.unit}
                              </p>
                              <p className="font-semibold text-[#8B7355]">
                                {formatPrice(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Tổng tiền:</span>
                        <span className="text-[#8B7355]">
                          {formatPrice(selectedStockIn.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trạng thái:</span>
                        <Badge className={getStockInStatusColor(selectedStockIn.status)}>
                          {getStockInStatusLabel(selectedStockIn.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedStockIn.notes && (
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm font-semibold text-yellow-800">Ghi chú:</p>
                    <p className="text-sm text-yellow-700">{selectedStockIn.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>

                  {selectedStockIn.status === 'CHO_DUYET' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy phiếu
                      </Button>
                      <Button
                        onClick={handleApprove}
                        className="bg-[#8B7355] hover:bg-[#6F5B44]"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Duyệt phiếu
                      </Button>
                    </>
                  )}

                  {selectedStockIn.status === 'DA_DUYET' && (
                    <Button
                      onClick={handleComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hoàn thành nhập kho
                    </Button>
                  )}

                  {selectedStockIn.status === 'HOAN_THANH' && (
                    <Button className="bg-[#8B7355] hover:bg-[#6F5B44]">
                      <FileText className="w-4 h-4 mr-2" />
                      In phiếu nhập
                    </Button>
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
