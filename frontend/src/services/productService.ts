import { apiClient, postForm } from './apiClient';
import { mapSanPhamToProduct, type SanPhamApi } from './apiMappers';
import { resolveProductImageUrl } from '@/lib/productImage';
import type { Product } from '@/types';

export type ProductStatus = 'DangBan' | 'NgungBan' | 'HetHang';

export type ProductQuery = {
  maDanhMuc?: number | null;
  search?: string;
};

export type ProductPayload = {
  maDanhMuc: number;
  tenSanPham: string;
  moTa?: string | null;
  hinhAnh?: string | null;
  giaBanGoc: number;
  ghiChuPhaChe?: string | null;
  trangThai: ProductStatus;
};

export type AdminProduct = Product & {
  maSanPham: number;
  maDanhMuc: number;
  tenDanhMuc: string;
  hinhAnh?: string | null;
  ghiChuPhaChe?: string | null;
  trangThai: ProductStatus;
};

function normalizeProductStatus(status: string): ProductStatus {
  if (status === 'NgungBan' || status === 'HetHang') return status;
  return 'DangBan';
}

function mapAdminProduct(dto: SanPhamApi): AdminProduct {
  return {
    id: String(dto.maSanPham),
    maSanPham: dto.maSanPham,
    name: dto.tenSanPham,
    description: dto.moTa ?? '',
    price: dto.giaBanGoc,
    image: resolveProductImageUrl(dto.hinhAnh, dto.maSanPham),
    category: dto.tenDanhMuc,
    maDanhMuc: dto.maDanhMuc,
    tenDanhMuc: dto.tenDanhMuc,
    hinhAnh: dto.hinhAnh ?? null,
    ghiChuPhaChe: dto.ghiChuPhaChe ?? null,
    trangThai: normalizeProductStatus(dto.trangThai),
  };
}

function buildQuery(params?: ProductQuery): string {
  const query = new URLSearchParams();
  if (params?.maDanhMuc) query.set('maDanhMuc', String(params.maDanhMuc));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  const value = query.toString();
  return value ? `?${value}` : '';
}

/** API sản phẩm từ database. */
export async function getProducts(params?: ProductQuery): Promise<Product[]> {
  const data = await apiClient.get<SanPhamApi[]>(`/san-pham${buildQuery(params)}`);
  return data.map(mapSanPhamToProduct);
}

export async function getAdminProducts(params?: ProductQuery): Promise<AdminProduct[]> {
  const data = await apiClient.get<SanPhamApi[]>(`/san-pham${buildQuery(params)}`);
  return data.map(mapAdminProduct);
}

export async function getProductById(id: number): Promise<AdminProduct> {
  const data = await apiClient.get<SanPhamApi>(`/san-pham/${id}`);
  return mapAdminProduct(data);
}

export async function getProductsByCategory(maDanhMuc: number): Promise<Product[]> {
  return getProducts({ maDanhMuc });
}

export async function createProduct(payload: ProductPayload): Promise<AdminProduct> {
  const data = await apiClient.post<SanPhamApi>('/san-pham', payload);
  return mapAdminProduct(data);
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<AdminProduct> {
  const data = await apiClient.put<SanPhamApi>(`/san-pham/${id}`, payload);
  return mapAdminProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete<void>(`/san-pham/${id}`);
}

/** Upload ảnh sản phẩm lên server (wwwroot) và cập nhật HinhAnh. */
export async function uploadProductImage(id: number, file: File): Promise<AdminProduct> {
  const formData = new FormData();
  formData.append('file', file);
  const data = await postForm<SanPhamApi>(`/san-pham/${id}/upload-anh`, formData);
  return mapAdminProduct(data);
}

/** @deprecated Dùng categoryService.getCategories() */
export async function getDanhMucList() {
  const { getCategories } = await import('./categoryService');
  return getCategories();
}
