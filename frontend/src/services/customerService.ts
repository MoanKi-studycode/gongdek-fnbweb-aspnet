import { apiClient } from './apiClient';
import { mapHoaDonListToInvoice, type HoaDonListApi } from './apiMappers';
import type { Customer } from '@/types';
import type { Invoice } from '@/types/modules';

export type { Customer };

export interface KhachHangApi {
  maKH: number;
  hoTen: string;
  soDienThoai: string;
  email: string;
  hangThanhVien: string;
  diemTichLuy: number;
  trangThai: string;
  tongChiTieu: number;
}

function mapMemberLevel(hang: string): Customer['memberLevel'] {
  switch (hang) {
    case 'KimCuong':
      return 'Kim cương';
    case 'Vang':
      return 'Vàng';
    case 'Bac':
      return 'Bạc';
    default:
      return 'Bạc';
  }
}

export function mapKhachHangToCustomer(dto: KhachHangApi): Customer {
  return {
    id: String(dto.maKH),
    name: dto.hoTen,
    phone: dto.soDienThoai,
    points: dto.diemTichLuy,
    totalSpent: dto.tongChiTieu,
    memberLevel: mapMemberLevel(dto.hangThanhVien),
  };
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiClient.get<KhachHangApi[]>(`/khach-hang${query}`);
  return data.map(mapKhachHangToCustomer);
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  try {
    const data = await apiClient.get<KhachHangApi>(`/khach-hang/phone/${encodeURIComponent(phone)}`);
    return mapKhachHangToCustomer(data);
  } catch {
    return null;
  }
}

export async function createCustomer(payload: {
  hoTen: string;
  soDienThoai: string;
  email?: string;
}): Promise<Customer> {
  const data = await apiClient.post<KhachHangApi>('/khach-hang', payload);
  return mapKhachHangToCustomer(data);
}

export async function updateCustomer(
  id: number | string,
  payload: Partial<{ hoTen: string; soDienThoai: string; email: string; diemTichLuy: number }>,
): Promise<Customer> {
  const data = await apiClient.put<KhachHangApi>(`/khach-hang/${id}`, payload);
  return mapKhachHangToCustomer(data);
}

export async function getMyProfile(): Promise<Customer> {
  const data = await apiClient.get<KhachHangApi>('/khach-hang/me');
  return mapKhachHangToCustomer(data);
}

export async function getMyInvoices(limit = 20): Promise<Invoice[]> {
  const data = await apiClient.get<HoaDonListApi[]>(`/khach-hang/me/hoa-don?limit=${limit}`);
  return data.map(mapHoaDonListToInvoice);
}
