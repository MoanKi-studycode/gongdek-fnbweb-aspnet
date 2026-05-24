import { apiClient } from './apiClient';

export type EmployeeStatus = 'HoatDong' | 'Khoa';
export type EmployeeRole = 'QuanLy' | 'NhanVien';

export interface Employee {
  maNV: number;
  hoTen: string;
  soDienThoai?: string | null;
  ngaySinh?: string | null;
  gioiTinh?: string | null;
  diaChi?: string | null;
  tenDangNhap: string;
  maVaiTro: number;
  tenVaiTro: EmployeeRole;
  trangThai: EmployeeStatus;
  ngayTao: string;
}

export interface EmployeeRoleOption {
  maVaiTro: number;
  tenVaiTro: EmployeeRole;
  moTa?: string | null;
}

export interface CreateEmployeeRequest {
  hoTen: string;
  soDienThoai?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  tenDangNhap: string;
  matKhau: string;
  maVaiTro: number;
}

export interface UpdateEmployeeRequest {
  hoTen: string;
  soDienThoai?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  maVaiTro: number;
  matKhau?: string;
}

export interface EmployeeQuery {
  search?: string;
  maVaiTro?: number;
}

export function getRoleLabel(role: EmployeeRole): string {
  const labels: Record<EmployeeRole, string> = {
    QuanLy: 'Quản lý',
    NhanVien: 'Nhân viên',
  };
  return labels[role] ?? role;
}

export function getStatusLabel(status: EmployeeStatus): string {
  return status === 'HoatDong' ? 'Đang hoạt động' : 'Đã khóa';
}

export async function getEmployees(query: EmployeeQuery = {}): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.maVaiTro) params.set('maVaiTro', String(query.maVaiTro));

  const qs = params.toString();
  return apiClient.get<Employee[]>(`/nhan-vien${qs ? `?${qs}` : ''}`);
}

export async function getEmployeeById(id: number): Promise<Employee> {
  return apiClient.get<Employee>(`/nhan-vien/${id}`);
}

export async function getEmployeeRoles(): Promise<EmployeeRoleOption[]> {
  return apiClient.get<EmployeeRoleOption[]>('/nhan-vien/vai-tro');
}

export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
  return apiClient.post<Employee>('/nhan-vien', data);
}

export async function updateEmployee(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
  return apiClient.put<Employee>(`/nhan-vien/${id}`, data);
}

export async function lockEmployee(id: number): Promise<Employee> {
  return apiClient.put<Employee>(`/nhan-vien/${id}/khoa`);
}

export async function unlockEmployee(id: number): Promise<Employee> {
  return apiClient.put<Employee>(`/nhan-vien/${id}/mo-khoa`);
}
