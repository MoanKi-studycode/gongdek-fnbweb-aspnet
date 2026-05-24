import { apiClient } from './apiClient';
import type { DanhMucApi } from './apiMappers';

export type Category = {
  id: string;
  maDanhMuc: number;
  name: string;
  moTa?: string;
  trangThai: string;
  productCount: number;
};

/** API read-only danh mục từ database. */
export async function getCategories(): Promise<Category[]> {
  const data = await apiClient.get<DanhMucApi[]>('/danh-muc');
  return data.map((item) => ({
    id: String(item.maDanhMuc),
    maDanhMuc: item.maDanhMuc,
    name: item.tenDanhMuc,
    moTa: item.moTa ?? undefined,
    trangThai: item.trangThai,
    productCount: 0,
  }));
}
