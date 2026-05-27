import { apiClient } from './apiClient';
import type { ToppingApi } from './apiMappers';

export type Topping = {
  id: string;
  maTopping: number;
  name: string;
  price: number;
  trangThai: string;
};

export type CreateToppingInput = {
  tenTopping: string;
  donGia: number;
  trangThai: string;
};

export type UpdateToppingInput = CreateToppingInput;

function mapToppingApi(item: ToppingApi): Topping {
  return {
    id: String(item.maTopping),
    maTopping: item.maTopping,
    name: item.tenTopping,
    price: item.donGia,
    trangThai: item.trangThai,
  };
}

export async function getToppings(): Promise<Topping[]> {
  const data = await apiClient.get<ToppingApi[]>('/topping');
  return data.map(mapToppingApi);
}

export async function createTopping(input: CreateToppingInput): Promise<Topping> {
  const data = await apiClient.post<ToppingApi>('/topping', input);
  return mapToppingApi(data);
}

export async function updateTopping(id: number, input: UpdateToppingInput): Promise<Topping> {
  const data = await apiClient.put<ToppingApi>(`/topping/${id}`, input);
  return mapToppingApi(data);
}

export async function deleteTopping(id: number): Promise<void> {
  await apiClient.delete<void>(`/topping/${id}`);
}
