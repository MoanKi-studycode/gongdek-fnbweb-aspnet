import { apiClient, downloadFile } from './apiClient';

export interface TopSanPham {
  tenSanPham: string;
  soLuong: number;
}

export interface DoanhThuNgay {
  nhan: string;
  ngay: string;
  doanhThu: number;
}

export interface DonOnlineCho {
  maHoaDon: number;
  hoTen: string;
  tongThanhToan: number;
  thoiGianLap: string;
}

export interface NguyenLieuCanhBao {
  maNL: number;
  tenNguyenLieu: string;
  soLuongTon: number;
  donViTinh: string;
  nguongCanhBao: number;
  trangThai: 'SapHet' | 'HetHang';
}

export interface DashboardTongQuan {
  doanhThuHomNay: number;
  doanhThuThang: number;
  soHoaDonHomNay: number;
  soDonTaiQuay: number;
  soDonOnline: number;
  soKhachHomNay: number;
  khachMoiHomNay: number;
  donOnlineChoXacNhan: number;
  topSanPham: TopSanPham[];
  doanhThu7Ngay: DoanhThuNgay[];
  donOnlineCho: DonOnlineCho[];
  nguyenLieuSapHet: NguyenLieuCanhBao[];
}

export interface DoanhThuThongKe {
  tongDoanhThu: number;
  soHoaDon: number;
  tuNgay: string;
  denNgay: string;
}

export interface DonHomNay {
  tongDon: number;
  donTaiQuay: number;
  donOnline: number;
  tongDoanhThu: number;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Gọi API lấy tổng quan dashboard */
export async function getDashboardOverview(): Promise<DashboardTongQuan> {
  return apiClient.get<DashboardTongQuan>('/dashboard/tong-quan');
}

/** Alias tương thích code cũ */
export const getDashboardTongQuan = getDashboardOverview;

/** Gọi API tổng doanh thu theo khoảng thời gian */
export async function getRevenueReport(params?: { tuNgay?: string; denNgay?: string }): Promise<DoanhThuThongKe> {
  return apiClient.get<DoanhThuThongKe>(`/dashboard/doanh-thu${buildQuery(params)}`);
}

/** Alias tương thích code cũ */
export const getDoanhThu = getRevenueReport;

/** Gọi API thống kê đơn hàng hôm nay */
export async function getDonHomNay(): Promise<DonHomNay> {
  return apiClient.get<DonHomNay>('/dashboard/don-hom-nay');
}

/** Gọi API top sản phẩm bán chạy */
export async function getTopProducts(params?: { limit?: number; tuNgay?: string; denNgay?: string }): Promise<TopSanPham[]> {
  return apiClient.get<TopSanPham[]>(`/dashboard/top-san-pham${buildQuery(params)}`);
}

/** Alias tương thích code cũ */
export const getTopSanPham = getTopProducts;

/** Gọi API đơn online chờ xác nhận */
export async function getDonOnlineChoXacNhan(limit = 10): Promise<DonOnlineCho[]> {
  return apiClient.get<DonOnlineCho[]>(`/dashboard/don-online-cho-xac-nhan?limit=${limit}`);
}

/** Gọi API cảnh báo nguyên liệu */
export async function getCanhBaoNguyenLieu(limit = 10): Promise<NguyenLieuCanhBao[]> {
  return apiClient.get<NguyenLieuCanhBao[]>(`/dashboard/canh-bao-nguyen-lieu?limit=${limit}`);
}

/** Xuất báo cáo doanh thu Excel */
export async function exportRevenueExcel(tuNgay?: string, denNgay?: string): Promise<void> {
  const qs = buildQuery({ tuNgay, denNgay });
  await downloadFile(`/bao-cao/doanh-thu/excel${qs}`, `BaoCaoDoanhThu_GongDek_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/** Xuất báo cáo doanh thu PDF */
export async function exportRevenuePdf(tuNgay?: string, denNgay?: string): Promise<void> {
  const qs = buildQuery({ tuNgay, denNgay });
  await downloadFile(`/bao-cao/doanh-thu/pdf${qs}`, `BaoCaoDoanhThu_GongDek_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** Nhãn trạng thái tồn kho nguyên liệu */
export function getStockAlertLabel(trangThai: NguyenLieuCanhBao['trangThai']): string {
  return trangThai === 'HetHang' ? 'Dưới mức' : 'Sắp hết';
}

/** Tính thời gian tương đối từ datetime */
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
