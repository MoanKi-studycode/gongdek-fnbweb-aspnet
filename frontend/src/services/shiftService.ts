import { apiClient } from './apiClient';

/** Khung ca làm việc */
export interface KhungCa {
  maKhungCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: string;
}

/** Ca làm việc */
export interface CaLamViec {
  maCa: number;
  maKhungCa: number;
  tenCa: string;
  maNV: number;
  hoTenNV: string;
  ngayLam: string;
  thoiGianMo: string;
  thoiGianDong?: string | null;
  tienQuyDauCa: number;
  tienMatThucTe?: number | null;
  trangThaiCa: 'DangMo' | 'DaDong';
  ghiChu?: string | null;
}

export interface ShiftQuery {
  tuNgay?: string;
  denNgay?: string;
  maNV?: number;
  maKhungCa?: number;
  trangThaiCa?: 'DangMo' | 'DaDong';
}

export interface MoCaRequest {
  maKhungCa: number;
  maNV: number;
  tienQuyDauCa: number;
  ngayLam?: string;
  ghiChu?: string;
}

export interface DongCaRequest {
  tienMatThucTe: number;
  ghiChu?: string;
}

/** Nhãn trạng thái ca */
export function getShiftStatusLabel(status: CaLamViec['trangThaiCa']): string {
  return status === 'DangMo' ? 'Đang mở' : 'Đã đóng';
}

/** Định dạng giờ khung ca */
export function formatTimeSlot(gioBatDau: string, gioKetThuc: string): string {
  const fmt = (t: string) => t.slice(0, 5);
  return `${fmt(gioBatDau)} - ${fmt(gioKetThuc)}`;
}

/** Gọi API lấy danh sách khung ca */
export async function getKhungCaList(): Promise<KhungCa[]> {
  return apiClient.get<KhungCa[]>('/khung-ca');
}

/** Gọi API lấy lịch sử ca làm việc */
export async function getCaLamViecList(query: ShiftQuery = {}): Promise<CaLamViec[]> {
  const params = new URLSearchParams();
  if (query.tuNgay) params.set('tuNgay', query.tuNgay);
  if (query.denNgay) params.set('denNgay', query.denNgay);
  if (query.maNV) params.set('maNV', String(query.maNV));
  if (query.maKhungCa) params.set('maKhungCa', String(query.maKhungCa));
  if (query.trangThaiCa) params.set('trangThaiCa', query.trangThaiCa);

  const qs = params.toString();
  return apiClient.get<CaLamViec[]>(`/ca-lam-viec${qs ? `?${qs}` : ''}`);
}

/** Gọi API lấy ca đang mở */
export async function getCaDangMo(): Promise<CaLamViec[]> {
  return apiClient.get<CaLamViec[]>('/ca-lam-viec/dang-mo');
}

/** Gọi API mở ca làm việc */
export async function moCa(data: MoCaRequest): Promise<CaLamViec> {
  return apiClient.post<CaLamViec>('/ca-lam-viec/mo-ca', data);
}

/** Gọi API đóng ca làm việc */
export async function dongCa(id: number, data: DongCaRequest): Promise<CaLamViec> {
  return apiClient.put<CaLamViec>(`/ca-lam-viec/${id}/dong-ca`, data);
}
