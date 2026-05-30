import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';
import type { Customer } from '@/types';
import {
  formatCustomerPrice,
  getCustomerStatusLabel,
  getMemberLevelColor,
} from '@/components/customers/customerUi';

interface CustomerDetailDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailDialog({ customer, open, onOpenChange }: CustomerDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thông tin khách hàng</DialogTitle>
        </DialogHeader>

        {customer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                  <p className="text-lg font-semibold">{customer.name}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                  <p className="text-lg font-semibold">{customer.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold break-all">{customer.email || '—'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Hạng thành viên</p>
                  <Badge className={getMemberLevelColor(customer.memberLevel)}>
                    {customer.memberLevel}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Mã khách hàng</p>
                  <p className="text-lg font-mono font-semibold">{customer.id}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Trạng thái tài khoản</p>
                  <p className="text-lg font-semibold">{getCustomerStatusLabel(customer.status)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#FAF8F3]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Điểm tích lũy</p>
                      <p className="text-3xl font-bold text-[#8B7355] mt-1">{customer.points}</p>
                    </div>
                    <Award className="w-12 h-12 text-[#8B7355] opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#E8DCC4]">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold text-[#8B7355] mt-1">
                      {formatCustomerPrice(customer.totalSpent)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Quyền lợi thành viên</h3>
                <div className="space-y-2 text-sm">
                  {customer.memberLevel === 'Bạc' && (
                    <>
                      <p className="text-gray-600">• Tích điểm: 1 điểm/10.000đ</p>
                      <p className="text-gray-600">• Sinh nhật: Voucher 20.000đ</p>
                    </>
                  )}
                  {customer.memberLevel === 'Vàng' && (
                    <>
                      <p className="text-gray-600">• Tích điểm: 1.5 điểm/10.000đ</p>
                      <p className="text-gray-600">• Sinh nhật: Voucher 50.000đ</p>
                      <p className="text-gray-600">• Ưu tiên đặt hàng trước</p>
                    </>
                  )}
                  {customer.memberLevel === 'Kim cương' && (
                    <>
                      <p className="text-gray-600">• Tích điểm: 2 điểm/10.000đ</p>
                      <p className="text-gray-600">• Sinh nhật: Voucher 100.000đ</p>
                      <p className="text-gray-600">• Ưu tiên đặt hàng VIP</p>
                      <p className="text-gray-600">• Miễn phí ship toàn bộ đơn</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
