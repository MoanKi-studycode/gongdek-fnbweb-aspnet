import { apiClient } from './apiClient';
import {
  mapHoaDonDetailToInvoice,
  mapHoaDonListToInvoice,
  type HoaDonDetailApi,
  type HoaDonListApi,
} from './apiMappers';
import type { Invoice } from '@/types/modules';

export type InvoiceQuery = {
  trangThai?: string;
  tuNgay?: string;
  denNgay?: string;
};

function buildQuery(params?: InvoiceQuery): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.trangThai) q.set('trangThai', params.trangThai);
  if (params.tuNgay) q.set('tuNgay', params.tuNgay);
  if (params.denNgay) q.set('denNgay', params.denNgay);
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** API read-only hóa đơn từ database. */
export async function getInvoices(params?: InvoiceQuery): Promise<Invoice[]> {
  const data = await apiClient.get<HoaDonListApi[]>(`/hoa-don${buildQuery(params)}`);
  return data.map(mapHoaDonListToInvoice);
}

export async function getInvoiceById(id: number | string): Promise<Invoice> {
  const data = await apiClient.get<HoaDonDetailApi>(`/hoa-don/${id}`);
  return mapHoaDonDetailToInvoice(data);
}
