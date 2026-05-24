import { apiClient } from './apiClient';
import { mapToppingApi, type ToppingApi } from './apiMappers';
import type { Topping } from '@/types';

/** API read-only topping từ database. */
export async function getToppings(): Promise<Topping[]> {
  const data = await apiClient.get<ToppingApi[]>('/topping');
  return data.map(mapToppingApi);
}
