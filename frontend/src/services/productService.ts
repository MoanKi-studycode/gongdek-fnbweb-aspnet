import { apiClient } from './apiClient';
import { mapSanPhamToProduct, type SanPhamApi } from './apiMappers';
import type { Product } from '@/types';

/** API read-only sản phẩm từ database. */
export async function getProducts(): Promise<Product[]> {
  const data = await apiClient.get<SanPhamApi[]>('/san-pham');
  return data.map(mapSanPhamToProduct);
}

export async function getProductsByCategory(maDanhMuc: number): Promise<Product[]> {
  const data = await apiClient.get<SanPhamApi[]>(`/san-pham?maDanhMuc=${maDanhMuc}`);
  return data.map(mapSanPhamToProduct);
}

/** @deprecated Dùng categoryService.getCategories() */
export async function getDanhMucList() {
  const { getCategories } = await import('./categoryService');
  return getCategories();
}
