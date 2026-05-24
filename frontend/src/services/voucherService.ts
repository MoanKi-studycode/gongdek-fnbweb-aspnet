import { apiClient } from './apiClient';
import type { Voucher } from '@/types';

export type { Voucher };

// TODO [Nguyễn Hoài Phương]: Hoàn thiện API /api/voucher

/** Gọi API danh sách voucher */
export async function getVouchers(): Promise<Voucher[]> {
  try {
    return await apiClient.get<Voucher[]>('/voucher');
  } catch {
    return [];
  }
}

/** Kiểm tra voucher hết hạn */
export function isVoucherExpired(voucher: Voucher): boolean {
  return new Date(voucher.expiryDate) < new Date();
}

/** Tìm voucher theo mã — dùng cho POS */
export async function findVoucherByCode(code: string): Promise<Voucher | null> {
  try {
    return await apiClient.get<Voucher>(`/voucher/code/${encodeURIComponent(code)}`);
  } catch {
    return null;
  }
}

/** Kiểm tra voucher có hợp lệ cho đơn hàng */
export function isVoucherValid(voucher: Voucher, orderTotal: number): boolean {
  if (isVoucherExpired(voucher)) return false;
  return orderTotal >= voucher.minOrder;
}
