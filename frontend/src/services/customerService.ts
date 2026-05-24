import { apiClient } from './apiClient';
import type { Customer } from '@/types';

export type { Customer };

// TODO [Nguyễn Hoài Phương]: Hoàn thiện API /api/khach-hang

/** Gọi API danh sách khách hàng */
export async function getCustomers(): Promise<Customer[]> {
  try {
    return await apiClient.get<Customer[]>('/khach-hang');
  } catch {
    return [];
  }
}

/** Tìm khách hàng theo SĐT — dùng cho POS */
export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  try {
    return await apiClient.get<Customer>(`/khach-hang/phone/${encodeURIComponent(phone)}`);
  } catch {
    return null;
  }
}
