import { apiClient } from './apiClient';
import type { ProductReview, ProductReviewSummary } from '@/types/modules';

export interface DanhGiaApi {
  maDanhGia: number;
  maHoaDon: number;
  maSanPham: number;
  tenSanPham: string;
  nguoiDung: string;
  soSao: number;
  binhLuan?: string | null;
  ngayDanhGia: string;
}

export interface DanhGiaTomTatApi {
  maSanPham: number;
  soDanhGia: number;
  diemTrungBinh: number;
}

function mapReview(dto: DanhGiaApi): ProductReview {
  return {
    id: String(dto.maDanhGia),
    invoiceId: String(dto.maHoaDon),
    productId: String(dto.maSanPham),
    productName: dto.tenSanPham,
    userName: dto.nguoiDung,
    stars: dto.soSao,
    comment: dto.binhLuan ?? undefined,
    createdAt: dto.ngayDanhGia,
  };
}

function mapSummary(dto: DanhGiaTomTatApi): ProductReviewSummary {
  return {
    productId: String(dto.maSanPham),
    count: dto.soDanhGia,
    averageRating: dto.diemTrungBinh,
  };
}

export async function getAllReviews(): Promise<ProductReview[]> {
  const data = await apiClient.get<DanhGiaApi[]>('/danh-gia');
  return data.map(mapReview);
}

export async function getReviewsByProduct(productId: number | string): Promise<ProductReview[]> {
  const data = await apiClient.get<DanhGiaApi[]>(`/danh-gia/san-pham/${productId}`);
  return data.map(mapReview);
}

export async function getReviewSummaries(): Promise<ProductReviewSummary[]> {
  const data = await apiClient.get<DanhGiaTomTatApi[]>('/danh-gia/tom-tat');
  return data.map(mapSummary);
}

export async function getReviewSummaryByProduct(
  productId: number | string,
): Promise<ProductReviewSummary | null> {
  try {
    const data = await apiClient.get<DanhGiaTomTatApi>(`/danh-gia/san-pham/${productId}/tom-tat`);
    return mapSummary(data);
  } catch {
    return null;
  }
}

export async function getReviewsByInvoice(invoiceId: number | string): Promise<ProductReview[]> {
  const data = await apiClient.get<DanhGiaApi[]>(`/danh-gia/hoa-don/${invoiceId}`);
  return data.map(mapReview);
}

export async function createReview(payload: {
  maHoaDon: number;
  maSanPham: number;
  soSao: number;
  noiDung?: string;
}): Promise<ProductReview> {
  const data = await apiClient.post<DanhGiaApi>('/danh-gia', payload);
  return mapReview(data);
}

export function buildReviewSummaryMap(
  summaries: ProductReviewSummary[],
): Record<string, ProductReviewSummary> {
  return Object.fromEntries(summaries.map((s) => [s.productId, s]));
}

export function formatReviewRating(value: number): string {
  return value.toFixed(1);
}
