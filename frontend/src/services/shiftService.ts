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

export interface DongCaTomTat {
  maCa: number;
  tienQuyDauCa: number;
  tongTienMatTrongCa: number;
  tienMatKyVong: number;
  soHoaDonTienMat: number;
  tongSoHoaDon: number;
}

interface DongCaTomTatApi {
  maCa: number;
  tienQuyDauCa: number;
  tongTienMatTrongCa: number;
  tienMatKyVong: number;
  soHoaDonTienMat: number;
  tongSoHoaDon: number;
}

function mapDongCaTomTat(dto: DongCaTomTatApi): DongCaTomTat {
  return {
    maCa: dto.maCa,
    tienQuyDauCa: dto.tienQuyDauCa,
    tongTienMatTrongCa: dto.tongTienMatTrongCa,
    tienMatKyVong: dto.tienMatKyVong,
    soHoaDonTienMat: dto.soHoaDonTienMat,
    tongSoHoaDon: dto.tongSoHoaDon,
  };
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

/** Kiểm tra giờ hiện tại có nằm trong khung ca (± tolerance phút). */
export function isKhungCaActiveNow(
  gioBatDau: string,
  gioKetThuc: string,
  toleranceMinutes = 30,
): boolean {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(gioBatDau);
  const end = parseTimeToMinutes(gioKetThuc);
  return nowMinutes >= start - toleranceMinutes && nowMinutes <= end + toleranceMinutes;
}

function parseTimeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Cảnh báo khi mở ca ngoài khung giờ quy định. */
export function getKhungCaTimeWarning(khungCa: KhungCa, toleranceMinutes = 30): string | null {
  if (isKhungCaActiveNow(khungCa.gioBatDau, khungCa.gioKetThuc, toleranceMinutes)) {
    return null;
  }
  return `Giờ hiện tại nằm ngoài khung ${khungCa.tenCa} (${formatTimeSlot(khungCa.gioBatDau, khungCa.gioKetThuc)}). Bạn vẫn có thể mở ca nếu được phép.`;
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

/** Tóm tắt tiền mặt kỳ vọng trước khi đóng ca */
export async function getDongCaTomTat(id: number): Promise<DongCaTomTat> {
  const data = await apiClient.get<DongCaTomTatApi>(`/ca-lam-viec/${id}/tom-tat-dong-ca`);
  return mapDongCaTomTat(data);
}
