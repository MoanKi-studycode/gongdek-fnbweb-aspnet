import { apiClient } from './apiClient';
import type { SizeApi } from './apiMappers';

export type Size = {
  id: string;
  maSize: number;
  name: string;
  phuThu: number;
  trangThai: string;
};

/** API read-only size từ database. */
export async function getSizes(): Promise<Size[]> {
  const data = await apiClient.get<SizeApi[]>('/size');
  return data.map((item) => ({
    id: String(item.maSize),
    maSize: item.maSize,
    name: item.tenSize,
    phuThu: item.phuThu,
    trangThai: item.trangThai,
  }));
}
