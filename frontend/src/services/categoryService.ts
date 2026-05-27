import { apiClient } from './apiClient';
import type { DanhMucApi } from './apiMappers';

export type CategoryStatus = 'HienThi' | 'An';

export type Category = {
  id: string;
  maDanhMuc: number;
  name: string;
  moTa?: string;
  thuTuHienThi: number;
  trangThai: CategoryStatus;
  productCount: number;
};

export type CategoryPayload = {
  tenDanhMuc: string;
  moTa?: string | null;
  thuTuHienThi: number;
  trangThai: CategoryStatus;
};

type DanhMucApiWithExtra = DanhMucApi & {
  thuTuHienThi?: number;
  soLuongSanPham?: number;
};

function mapCategory(item: DanhMucApiWithExtra): Category {
  return {
    id: String(item.maDanhMuc),
    maDanhMuc: item.maDanhMuc,
    name: item.tenDanhMuc,
    moTa: item.moTa ?? undefined,
    thuTuHienThi: item.thuTuHienThi ?? 0,
    trangThai: item.trangThai === 'An' ? 'An' : 'HienThi',
    productCount: item.soLuongSanPham ?? 0,
  };
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiClient.get<DanhMucApiWithExtra[]>('/danh-muc');
  return data.map(mapCategory);
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const data = await apiClient.post<DanhMucApiWithExtra>('/danh-muc', payload);
  return mapCategory(data);
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  const data = await apiClient.put<DanhMucApiWithExtra>(`/danh-muc/${id}`, payload);
  return mapCategory(data);
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete<void>(`/danh-muc/${id}`);
}
