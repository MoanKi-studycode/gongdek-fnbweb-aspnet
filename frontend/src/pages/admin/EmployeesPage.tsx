import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
import { Plus, Edit, Search, Users, Lock, Unlock } from 'lucide-react';
import {
  getEmployees,
  getEmployeeRoles,
  createEmployee,
  updateEmployee,
  lockEmployee,
  unlockEmployee,
  getRoleLabel,
  getStatusLabel,
  type Employee,
  type EmployeeRoleOption,
} from '@/services/employeeService';
import { lockEmployeeConfirmOptions, useConfirm } from '@/components/common/ConfirmDialog';
import { notifyError, notifySuccess, toastMessages } from '@/components/common/ToastMessage';
import { toast } from 'sonner';

interface EmployeeFormData {
  hoTen: string;
  soDienThoai: string;
  tenDangNhap: string;
  matKhau: string;
  maVaiTro: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChi: string;
}

const emptyForm: EmployeeFormData = {
  hoTen: '',
  soDienThoai: '',
  tenDangNhap: '',
  matKhau: '',
  maVaiTro: '',
  ngaySinh: '',
  gioiTinh: '',
  diaChi: '',
};

export function EmployeesPage() {
  const { confirm } = useConfirm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<EmployeeRoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Tải danh sách nhân viên và vai trò từ API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeList, roleList] = await Promise.all([
        getEmployees({
          search: searchQuery || undefined,
          maVaiTro: roleFilter !== 'all' ? Number(roleFilter) : undefined,
        }),
        getEmployeeRoles(),
      ]);
      setEmployees(employeeList);
      setRoles(roleList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const activeCount = employees.filter((e) => e.trangThai === 'HoatDong').length;

  const getRoleBadgeClass = (tenVaiTro: string) => {
    const colors: Record<string, string> = {
      QuanLy: 'bg-purple-100 text-purple-700',
      NhanVien: 'bg-green-100 text-green-700',
    };
    return colors[tenVaiTro] ?? 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeClass = (trangThai: string) =>
    trangThai === 'HoatDong' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN');

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        hoTen: employee.hoTen,
        soDienThoai: employee.soDienThoai ?? '',
        tenDangNhap: employee.tenDangNhap,
        matKhau: '',
        maVaiTro: String(employee.maVaiTro),
        ngaySinh: employee.ngaySinh ?? '',
        gioiTinh: employee.gioiTinh ?? '',
        diaChi: employee.diaChi ?? '',
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        ...emptyForm,
        maVaiTro: roles[0] ? String(roles[0].maVaiTro) : '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.maNV, {
          hoTen: formData.hoTen,
          soDienThoai: formData.soDienThoai || undefined,
          ngaySinh: formData.ngaySinh || undefined,
          gioiTinh: formData.gioiTinh || undefined,
          diaChi: formData.diaChi || undefined,
          maVaiTro: Number(formData.maVaiTro),
          matKhau: formData.matKhau || undefined,
        });
        toast.success('Cập nhật nhân viên thành công!');
      } else {
        await createEmployee({
          hoTen: formData.hoTen,
          soDienThoai: formData.soDienThoai || undefined,
          ngaySinh: formData.ngaySinh || undefined,
          gioiTinh: formData.gioiTinh || undefined,
          diaChi: formData.diaChi || undefined,
          tenDangNhap: formData.tenDangNhap,
          matKhau: formData.matKhau,
          maVaiTro: Number(formData.maVaiTro),
        });
        toast.success('Thêm nhân viên thành công!');
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (employee: Employee) => {
    const isLocked = employee.trangThai === 'Khoa';
    const ok = await confirm(lockEmployeeConfirmOptions(employee.hoTen, isLocked));
    if (!ok) return;

    try {
      if (isLocked) {
        await unlockEmployee(employee.maNV);
        notifySuccess(toastMessages.unlockSuccess);
      } else {
        await lockEmployee(employee.maNV);
        notifySuccess(toastMessages.lockSuccess);
      }
      await loadData();
    } catch (err) {
      notifyError(err, 'Không thể thay đổi trạng thái.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin nhân viên và phân quyền</p>
          </div>
          <div className="flex items-center gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#8B7355]" />
                  <div>
                    <p className="text-sm text-gray-600">Nhân viên đang hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#8B7355] hover:bg-[#6F5B44]"
              disabled={roles.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhân viên
            </Button>
          </div>
        </div>

        {/* Bộ lọc tìm kiếm */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên, tên đăng nhập hoặc SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Lọc vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.maVaiTro} value={String(role.maVaiTro)}>
                      {getRoleLabel(role.tenVaiTro)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trạng thái tải / lỗi / rỗng */}
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
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.maNV}>
                      <TableCell className="font-mono font-semibold">NV{String(employee.maNV).padStart(3, '0')}</TableCell>
                      <TableCell className="font-medium">{employee.hoTen}</TableCell>
                      <TableCell className="text-gray-600">{employee.tenDangNhap}</TableCell>
                      <TableCell>{employee.soDienThoai ?? '—'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeClass(employee.tenVaiTro)}>
                          {getRoleLabel(employee.tenVaiTro)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(employee.ngayTao)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(employee.trangThai)}>
                          {getStatusLabel(employee.trangThai)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(employee)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLock(employee)}
                            title={employee.trangThai === 'Khoa' ? 'Mở khóa' : 'Khóa tài khoản'}
                            className={
                              employee.trangThai === 'Khoa'
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-red-600 hover:text-red-700'
                            }
                          >
                            {employee.trangThai === 'Khoa' ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {employees.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Không tìm thấy nhân viên</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form thêm / sửa nhân viên */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee
                  ? 'Cập nhật thông tin nhân viên. Để trống mật khẩu nếu không đổi.'
                  : 'Nhập thông tin tài khoản nhân viên mới'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="hoTen">Họ tên *</Label>
                  <Input
                    id="hoTen"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="soDienThoai">Số điện thoại</Label>
                  <Input
                    id="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="tenDangNhap">Tên đăng nhập *</Label>
                  <Input
                    id="tenDangNhap"
                    value={formData.tenDangNhap}
                    onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                    placeholder="nhanvien01"
                    required
                    disabled={!!editingEmployee}
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="matKhau">
                    Mật khẩu {editingEmployee ? '(để trống nếu không đổi)' : '*'}
                  </Label>
                  <Input
                    id="matKhau"
                    type="password"
                    value={formData.matKhau}
                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                    placeholder="Tối thiểu 8 ký tự, có hoa, số, ký tự đặc biệt"
                    required={!editingEmployee}
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="maVaiTro">Vai trò *</Label>
                  <Select
                    value={formData.maVaiTro}
                    onValueChange={(value) => setFormData({ ...formData, maVaiTro: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.maVaiTro} value={String(role.maVaiTro)}>
                          {getRoleLabel(role.tenVaiTro)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="ngaySinh">Ngày sinh</Label>
                  <Input
                    id="ngaySinh"
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="gioiTinh">Giới tính</Label>
                  <Select
                    value={formData.gioiTinh || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gioiTinh: value === 'none' ? '' : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="diaChi">Địa chỉ</Label>
                  <Input
                    id="diaChi"
                    value={formData.diaChi}
                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                    placeholder="Địa chỉ liên hệ"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#8B7355] hover:bg-[#6F5B44]"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingEmployee ? 'Cập nhật' : 'Thêm nhân viên'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

