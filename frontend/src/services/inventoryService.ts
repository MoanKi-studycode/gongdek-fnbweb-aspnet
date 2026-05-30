import { apiClient } from './apiClient';
import type { InventoryItem, StockIn, StockInStatus, Supplier, InventoryStatus } from '@/types';

export type { InventoryItem, StockIn, StockInStatus, Supplier, InventoryStatus };

export type NguyenLieuStatus = 'ConHang' | 'SapHet' | 'HetHang' | 'NgungSuDung';
export type NhaCungCapStatus = 'DangHopTac' | 'NgungHopTac';
export type DieuChinhTonLoai = 'Nhap' | 'Xuat';

export interface NguyenLieu {
  maNL: number;
  tenNL: string;
  donViTinh: string;
  soLuongTon: number;
  soLuongCanhBao: number;
  hanSuDungGanNhat?: string | null;
  trangThai: NguyenLieuStatus;
  canhBaoTonKho: boolean;
  soLanNhap: number;
}

export interface CreateNguyenLieuInput {
  tenNL: string;
  donViTinh: string;
  soLuongTon: number;
  soLuongCanhBao: number;
  hanSuDungGanNhat?: string | null;
  trangThai: NguyenLieuStatus;
}

export type UpdateNguyenLieuInput = CreateNguyenLieuInput;

export interface NhaCungCap {
  maNCC: number;
  tenNCC: string;
  soDienThoai?: string | null;
  diaChi?: string | null;
  email?: string | null;
  nguoiLienHe?: string | null;
  trangThai: NhaCungCapStatus;
  soPhieuNhap: number;
}

export interface CreateNhaCungCapInput {
  tenNCC: string;
  soDienThoai?: string | null;
  diaChi?: string | null;
  email?: string | null;
  nguoiLienHe?: string | null;
  trangThai: NhaCungCapStatus;
}

export type UpdateNhaCungCapInput = CreateNhaCungCapInput;

export async function getNguyenLieus(params?: {
  search?: string;
  trangThai?: string;
  canhBao?: boolean;
}): Promise<NguyenLieu[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.trangThai && params.trangThai !== 'ALL') query.set('trangThai', params.trangThai);
  if (params?.canhBao !== undefined) query.set('canhBao', String(params.canhBao));

  const path = `/nguyen-lieu${query.toString() ? `?${query.toString()}` : ''}`;
  return apiClient.get<NguyenLieu[]>(path);
}

export async function getCanhBaoTonKho(): Promise<NguyenLieu[]> {
  return apiClient.get<NguyenLieu[]>('/nguyen-lieu/canh-bao-ton-kho');
}

export async function createNguyenLieu(input: CreateNguyenLieuInput): Promise<NguyenLieu> {
  return apiClient.post<NguyenLieu>('/nguyen-lieu', input);
}

export async function updateNguyenLieu(id: number, input: UpdateNguyenLieuInput): Promise<NguyenLieu> {
  return apiClient.put<NguyenLieu>(`/nguyen-lieu/${id}`, input);
}

export async function deleteNguyenLieu(id: number): Promise<void> {
  await apiClient.delete<void>(`/nguyen-lieu/${id}`);
}

export async function dieuChinhTonKho(
  id: number,
  input: { soLuong: number; loaiDieuChinh: DieuChinhTonLoai }
): Promise<NguyenLieu> {
  return apiClient.put<NguyenLieu>(`/nguyen-lieu/${id}/dieu-chinh-ton`, input);
}

export async function getNhaCungCaps(search?: string): Promise<NhaCungCap[]> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  return apiClient.get<NhaCungCap[]>(`/nha-cung-cap${query.toString() ? `?${query.toString()}` : ''}`);
}

export async function createNhaCungCap(input: CreateNhaCungCapInput): Promise<NhaCungCap> {
  return apiClient.post<NhaCungCap>('/nha-cung-cap', input);
}

export async function updateNhaCungCap(id: number, input: UpdateNhaCungCapInput): Promise<NhaCungCap> {
  return apiClient.put<NhaCungCap>(`/nha-cung-cap/${id}`, input);
}

export async function deleteNhaCungCap(id: number): Promise<void> {
  await apiClient.delete<void>(`/nha-cung-cap/${id}`);
}

/** Gọi API danh sách nguyên liệu theo type cũ để các trang cũ không lỗi */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const data = await getNguyenLieus();
    return data.map((item) => ({
      id: String(item.maNL),
      name: item.tenNL,
      category: item.trangThai,
      currentStock: item.soLuongTon,
      unit: item.donViTinh as InventoryItem['unit'],
      minStock: item.soLuongCanhBao,
      maxStock: Math.max(item.soLuongTon, item.soLuongCanhBao) * 2,
      lastUpdated: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/** Gọi API danh sách phiếu nhập kho */
export async function getStockInRecords(): Promise<StockIn[]> {
  try {
    const data = await getPhieuNhapKhos();
    return data.map(mapPhieuNhapToStockIn);
  } catch {
    return [];
  }
}

/** Gọi API danh sách nhà cung cấp theo type cũ */
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const data = await getNhaCungCaps();
    return data.map((item) => ({
      id: String(item.maNCC),
      name: item.tenNCC,
      phone: item.soDienThoai ?? '',
      email: item.email ?? '',
      address: item.diaChi ?? '',
    }));
  } catch {
    return [];
  }
}

/** Nhãn trạng thái phiếu nhập */
export function getStockInStatusLabel(status: StockInStatus): string {
  const labels: Record<StockInStatus, string> = {
    CHO_DUYET: 'Chờ duyệt',
    DA_DUYET: 'Đã duyệt',
    HUY: 'Đã hủy',
  };
  return labels[status];
}

/** Màu badge trạng thái phiếu nhập */
export function getStockInStatusColor(status: StockInStatus): string {
  const colors: Record<StockInStatus, string> = {
    CHO_DUYET: 'bg-orange-100 text-orange-700',
    DA_DUYET: 'bg-green-100 text-green-700',
    HUY: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}

/** Tính trạng thái tồn kho nguyên liệu */
export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.currentStock <= 0) return 'Hết hàng';
  if (item.currentStock <= item.minStock) return 'Sắp hết';
  return 'Đủ hàng';
}

/** Lọc nguyên liệu sắp hết */
export function getLowStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.currentStock <= item.minStock);
}

export type PhieuNhapTrangThai = 'ChoDuyet' | 'DaDuyet' | 'Huy';

export interface ChiTietPhieuNhapApi {
  maChiTietNhap: number;
  maNL: number;
  tenNL: string;
  donViTinh: string;
  soLuongNhap: number;
  donGiaNhap: number;
  hanSuDung?: string | null;
  thanhTien: number;
}

export interface PhieuNhapKhoApi {
  maPhieuNhap: number;
  maPhieuNhapText: string;
  maNCC: number;
  tenNCC: string;
  maNVLap: number;
  tenNVLap: string;
  maNVDuyet?: number | null;
  tenNVDuyet?: string | null;
  ngayNhap: string;
  ngayDuyet?: string | null;
  trangThaiPhieu: PhieuNhapTrangThai;
  tongTienNhap: number;
  ghiChu?: string | null;
  chiTiet: ChiTietPhieuNhapApi[];
}

export interface CreateChiTietPhieuNhapInput {
  maNL: number;
  soLuongNhap: number;
  donGiaNhap: number;
  hanSuDung?: string | null;
}

export interface CreatePhieuNhapKhoInput {
  maNCC: number;
  ngayNhap?: string | null;
  ghiChu?: string | null;
  chiTiet: CreateChiTietPhieuNhapInput[];
}

export async function getPhieuNhapKhos(params?: {
  trangThai?: string;
  maNCC?: number;
  tuNgay?: string;
  denNgay?: string;
}): Promise<PhieuNhapKhoApi[]> {
  const query = new URLSearchParams();
  if (params?.trangThai && params.trangThai !== 'ALL') query.set('trangThai', params.trangThai);
  if (params?.maNCC) query.set('maNCC', String(params.maNCC));
  if (params?.tuNgay) query.set('tuNgay', params.tuNgay);
  if (params?.denNgay) query.set('denNgay', params.denNgay);

  return apiClient.get<PhieuNhapKhoApi[]>(`/phieu-nhap-kho${query.toString() ? `?${query.toString()}` : ''}`);
}

export async function getPhieuNhapKho(id: number): Promise<PhieuNhapKhoApi> {
  return apiClient.get<PhieuNhapKhoApi>(`/phieu-nhap-kho/${id}`);
}

export async function createPhieuNhapKho(input: CreatePhieuNhapKhoInput): Promise<PhieuNhapKhoApi> {
  return apiClient.post<PhieuNhapKhoApi>('/phieu-nhap-kho', input);
}

export async function updatePhieuNhapKho(id: number, input: CreatePhieuNhapKhoInput): Promise<PhieuNhapKhoApi> {
  return apiClient.put<PhieuNhapKhoApi>(`/phieu-nhap-kho/${id}`, input);
}

export async function cancelPhieuNhapKho(id: number, ghiChu?: string): Promise<PhieuNhapKhoApi> {
  return apiClient.put<PhieuNhapKhoApi>(`/phieu-nhap-kho/${id}/huy`, { ghiChu });
}

export async function approvePhieuNhapKho(id: number, ghiChu?: string): Promise<PhieuNhapKhoApi> {
  return apiClient.put<PhieuNhapKhoApi>(`/phieu-nhap-kho/${id}/duyet`, { ghiChu });
}

export async function deletePhieuNhapKho(id: number): Promise<void> {
  await apiClient.delete<void>(`/phieu-nhap-kho/${id}`);
}

function mapPhieuTrangThaiToStockIn(status: PhieuNhapTrangThai): StockInStatus {
  const map: Record<PhieuNhapTrangThai, StockInStatus> = {
    ChoDuyet: 'CHO_DUYET',
    DaDuyet: 'DA_DUYET',
    Huy: 'HUY',
  };
  return map[status] ?? 'CHO_DUYET';
}

export function mapPhieuNhapToStockIn(item: PhieuNhapKhoApi): StockIn {
  return {
    id: String(item.maPhieuNhap),
    code: item.maPhieuNhapText,
    supplierId: String(item.maNCC),
    supplierName: item.tenNCC,
    items: item.chiTiet.map((detail) => ({
      inventoryId: String(detail.maNL),
      inventoryName: detail.tenNL,
      unit: detail.donViTinh,
      quantity: detail.soLuongNhap,
      unitPrice: detail.donGiaNhap,
      totalPrice: detail.thanhTien,
    })),
    totalAmount: item.tongTienNhap,
    status: mapPhieuTrangThaiToStockIn(item.trangThaiPhieu),
    createdBy: item.tenNVLap,
    createdAt: item.ngayNhap,
    approvedBy: item.tenNVDuyet ?? undefined,
    approvedAt: item.ngayDuyet ?? undefined,
    notes: item.ghiChu ?? '',
  };
}
