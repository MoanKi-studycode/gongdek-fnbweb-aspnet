export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
  size: 'M' | 'L';
  toppings: Topping[];
  notes: string;
}

export * from './modules';
