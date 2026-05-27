import { apiClient } from './apiClient';
import type { SizeApi } from './apiMappers';

export type Size = {
  id: string;
  maSize: number;
  name: string;
  phuThu: number;
  trangThai: string;
};

export type CreateSizeInput = {
  tenSize: string;
  phuThu: number;
  trangThai: string;
};

export type UpdateSizeInput = CreateSizeInput;

function mapSizeApi(item: SizeApi): Size {
  return {
    id: String(item.maSize),
    maSize: item.maSize,
    name: item.tenSize,
    phuThu: item.phuThu,
    trangThai: item.trangThai,
  };
}

export async function getSizes(): Promise<Size[]> {
  const data = await apiClient.get<SizeApi[]>('/size');
  return data.map(mapSizeApi);
}

export async function createSize(input: CreateSizeInput): Promise<Size> {
  const data = await apiClient.post<SizeApi>('/size', input);
  return mapSizeApi(data);
}

export async function updateSize(id: number, input: UpdateSizeInput): Promise<Size> {
  const data = await apiClient.put<SizeApi>(`/size/${id}`, input);
  return mapSizeApi(data);
}

export async function deleteSize(id: number): Promise<void> {
  await apiClient.delete<void>(`/size/${id}`);
}
