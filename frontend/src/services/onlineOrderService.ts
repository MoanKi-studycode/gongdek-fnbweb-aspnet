import { apiClient } from './apiClient';
import {
  mapDonHangOnlineDetail,
  mapDonHangOnlineList,
  mapOnlineStatusToApi,
  type DonHangOnlineDetailApi,
  type DonHangOnlineListApi,
} from './apiMappers';
import type { OnlineOrder, OrderStatus } from '@/types/modules';

export type { OnlineOrder, OrderStatus } from '@/types/modules';
export { getOrderStatusLabel, getOrderStatusColor } from './orderStatus';
export {
  getNextOnlineStatuses,
  getAllowedOnlineStatusOptions,
  getDefaultNextOnlineStatus,
  canUpdateOnlineStatus,
} from './orderStatus';

export async function getOnlineOrders(trangThai?: string): Promise<OnlineOrder[]> {
  const query = trangThai ? `?trangThai=${encodeURIComponent(trangThai)}` : '';
  const data = await apiClient.get<DonHangOnlineListApi[]>(`/don-hang-online${query}`);
  return data.map(mapDonHangOnlineList);
}

export async function getOnlineOrderById(id: number | string): Promise<OnlineOrder> {
  const data = await apiClient.get<DonHangOnlineDetailApi>(`/don-hang-online/${id}`);
  return mapDonHangOnlineDetail(data);
}

export interface CreateOnlineOrderLine {
  maSanPham: number;
  tenSize: 'M' | 'L';
  soLuong: number;
  ghiChu?: string;
  maToppings: number[];
}

export interface CreateOnlineOrderRequest {
  diaChiGiao: string;
  ghiChuGiaoHang?: string;
  maVoucher?: string;
  chiTiet: CreateOnlineOrderLine[];
}

export interface CreateOnlineOrderResponse {
  maHoaDon: number;
  trangThaiOnline?: string;
  trangThaiHoaDon: string;
  tongThanhToan: number;
}

export async function placeOnlineOrder(
  payload: CreateOnlineOrderRequest,
): Promise<CreateOnlineOrderResponse> {
  return apiClient.post<CreateOnlineOrderResponse>('/don-hang-online', payload);
}

export interface PosCheckoutLine {
  maSanPham: number;
  tenSize: 'M' | 'L';
  soLuong: number;
  ghiChu?: string;
  maToppings: number[];
}

export interface PosCheckoutRequest {
  soDienThoaiKhachHang?: string;
  maVoucher?: string;
  phuongThucThanhToan: 'TienMat' | 'ChuyenKhoan' | 'ViDienTu';
  tienKhachDua?: number;
  ghiChu?: string;
  chiTiet: PosCheckoutLine[];
}

export async function posCheckout(payload: PosCheckoutRequest): Promise<CreateOnlineOrderResponse> {
  return apiClient.post<CreateOnlineOrderResponse>('/don-hang-online/pos-checkout', payload);
}

export async function updateOnlineOrderStatus(
  id: number | string,
  status: OrderStatus,
  lyDoHuy?: string,
): Promise<void> {
  await apiClient.put(`/don-hang-online/${id}/update-status`, {
    trangThai: mapOnlineStatusToApi(status),
    lyDoHuy,
  });
}

export async function cancelOnlineOrder(
  id: number | string,
  lyDoHuy: string,
  soTienHoan?: number,
): Promise<void> {
  await apiClient.post(`/don-hang-online/${id}/cancel`, {
    lyDoHuy,
    soTienHoan,
    hinhThucHoan: 'ChuyenKhoan',
  });
}
