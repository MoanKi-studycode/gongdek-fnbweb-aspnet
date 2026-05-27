import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Eye, Award } from 'lucide-react';
import { getCustomers } from '@/services/customerService';
import type { Customer } from '@/types';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getMemberLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Bạc': 'bg-gray-100 text-gray-700',
      'Vàng': 'bg-yellow-100 text-yellow-700',
      'Kim cương': 'bg-blue-100 text-blue-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin khách hàng và điểm tích lũy
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-[#8B7355]">{customers.length}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã KH</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Điểm tích lũy</TableHead>
                  <TableHead>Hạng thành viên</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-[#8B7355] mr-2" />
                        <span className="font-semibold text-[#8B7355]">
                          {customer.points} điểm
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMemberLevelColor(customer.memberLevel)}>
                        {customer.memberLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(customer)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Không tìm thấy khách hàng</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thông tin khách hàng</DialogTitle>
            </DialogHeader>

            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                      <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                      <p className="text-lg font-semibold">{selectedCustomer.phone}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Hạng thành viên</p>
                      <Badge className={getMemberLevelColor(selectedCustomer.memberLevel)}>
                        {selectedCustomer.memberLevel}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Mã khách hàng</p>
                      <p className="text-lg font-mono font-semibold">{selectedCustomer.id}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-[#FAF8F3]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Điểm tích lũy</p>
                          <p className="text-3xl font-bold text-[#8B7355] mt-1">
                            {selectedCustomer.points}
                          </p>
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
                          {formatPrice(selectedCustomer.totalSpent)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Member Benefits */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Quyền lợi thành viên</h3>
                    <div className="space-y-2 text-sm">
                      {selectedCustomer.memberLevel === 'Bạc' && (
                        <>
                          <p className="text-gray-600">• Tích điểm: 1 điểm/10.000đ</p>
                          <p className="text-gray-600">• Sinh nhật: Voucher 20.000đ</p>
                        </>
                      )}
                      {selectedCustomer.memberLevel === 'Vàng' && (
                        <>
                          <p className="text-gray-600">• Tích điểm: 1.5 điểm/10.000đ</p>
                          <p className="text-gray-600">• Sinh nhật: Voucher 50.000đ</p>
                          <p className="text-gray-600">• Ưu tiên đặt hàng trước</p>
                        </>
                      )}
                      {selectedCustomer.memberLevel === 'Kim cương' && (
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
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

