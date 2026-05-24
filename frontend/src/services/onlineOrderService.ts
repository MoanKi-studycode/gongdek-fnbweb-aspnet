import { apiClient } from './apiClient';
import {
  mapDonHangOnlineDetail,
  mapDonHangOnlineList,
  type DonHangOnlineDetailApi,
  type DonHangOnlineListApi,
} from './apiMappers';
import type { OnlineOrder } from '@/types/modules';

export type { OnlineOrder, OrderStatus } from '@/types/modules';
export { getOrderStatusLabel, getOrderStatusColor } from './orderStatus';

/** API read-only đơn online từ database. */
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
  chiTiet: CreateOnlineOrderLine[];
}

export interface CreateOnlineOrderResponse {
  maHoaDon: number;
  trangThaiOnline: string;
}

/** Đặt hàng online — yêu cầu đăng nhập KhachHang; MaKH lấy từ token. */
export async function placeOnlineOrder(
  payload: CreateOnlineOrderRequest,
): Promise<CreateOnlineOrderResponse> {
  return apiClient.post<CreateOnlineOrderResponse>('/don-hang-online', payload);
}
