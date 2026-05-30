import { apiClient } from './apiClient';
import type { Voucher } from '@/types';

export type { Voucher };

export interface VoucherApi {
  maVoucher: number;
  maCode: string;
  moTa?: string | null;
  loaiGiam: 'PHAN_TRAM' | 'SO_TIEN';
  giaTriGiam: number;
  donHangToiThieu?: number | null;
  giamToiDa?: number | null;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
}

export function mapVoucherApi(dto: VoucherApi): Voucher {
  const status = dto.trangThai === 'HetHan' ? 'HetHan' : 'ConHieuLuc';
  return {
    id: String(dto.maVoucher),
    code: dto.maCode,
    name: dto.moTa?.split('|')[1]?.trim() || dto.maCode,
    type: dto.loaiGiam,
    value: dto.giaTriGiam,
    minOrder: dto.donHangToiThieu ?? 0,
    maxDiscount: dto.giamToiDa ?? undefined,
    expiryDate: dto.ngayKetThuc,
    status,
  };
}

export function getVoucherStatusBadge(voucher: Voucher): { label: string; className: string } {
  if (voucher.status === 'HetHan') {
    return { label: 'Ngừng hiệu lực', className: 'bg-gray-100 text-gray-700' };
  }
  if (isVoucherExpired(voucher)) {
    return { label: 'Hết hạn', className: 'bg-red-100 text-red-700' };
  }
  return { label: 'Còn hiệu lực', className: 'bg-green-100 text-green-700' };
}

export async function getVouchers(): Promise<Voucher[]> {
  const data = await apiClient.get<VoucherApi[]>('/voucher');
  return data.map(mapVoucherApi);
}

export function isVoucherExpired(voucher: Voucher): boolean {
  return new Date(voucher.expiryDate) < new Date();
}

export async function findVoucherByCode(code: string): Promise<Voucher | null> {
  try {
    const data = await apiClient.get<VoucherApi>(`/voucher/code/${encodeURIComponent(code)}`);
    const voucher = mapVoucherApi(data);
    if (voucher.status !== 'ConHieuLuc' || isVoucherExpired(voucher)) return null;
    return voucher;
  } catch {
    return null;
  }
}

export function isVoucherValid(voucher: Voucher, orderTotal: number): boolean {
  if (voucher.status !== 'ConHieuLuc' || isVoucherExpired(voucher)) return false;
  return orderTotal >= voucher.minOrder;
}

export async function createVoucher(payload: {
  maCode: string;
  moTa?: string;
  loaiGiam: 'PHAN_TRAM' | 'SO_TIEN';
  giaTriGiam: number;
  donHangToiThieu?: number;
  giamToiDa?: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}): Promise<Voucher> {
  const data = await apiClient.post<VoucherApi>('/voucher', payload);
  return mapVoucherApi(data);
}

export async function updateVoucher(
  id: number | string,
  payload: Parameters<typeof createVoucher>[0] & { trangThai?: string },
): Promise<Voucher> {
  const data = await apiClient.put<VoucherApi>(`/voucher/${id}`, payload);
  return mapVoucherApi(data);
}

export async function deleteVoucher(id: number | string): Promise<void> {
  await apiClient.delete(`/voucher/${id}`);
}
