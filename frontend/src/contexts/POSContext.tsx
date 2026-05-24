import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Topping } from '@/types';
import type { Customer, Voucher } from '@/types';

export interface POSOrderItem {
  product: Product;
  size: 'M' | 'L';
  toppings: Topping[];
  notes: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface POSContextType {
  orderItems: POSOrderItem[];
  customer: Customer | null;
  voucher: Voucher | null;
  paymentMethod: 'cash' | 'transfer' | 'ewallet';
  addOrderItem: (item: POSOrderItem) => void;
  removeOrderItem: (index: number) => void;
  updateOrderItem: (index: number, item: POSOrderItem) => void;
  clearOrder: () => void;
  setCustomer: (customer: Customer | null) => void;
  setVoucher: (voucher: Voucher | null) => void;
  setPaymentMethod: (method: 'cash' | 'transfer' | 'ewallet') => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [orderItems, setOrderItems] = useState<POSOrderItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'ewallet'>('cash');

  const addOrderItem = (item: POSOrderItem) => {
    setOrderItems([...orderItems, item]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, item: POSOrderItem) => {
    const newItems = [...orderItems];
    newItems[index] = item;
    setOrderItems(newItems);
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomer(null);
    setVoucher(null);
    setPaymentMethod('cash');
  };

  const getSubtotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getDiscount = () => {
    if (!voucher) return 0;

    const subtotal = getSubtotal();
    if (subtotal < voucher.minOrder) return 0;

    if (voucher.type === 'SO_TIEN') {
      return voucher.value;
    } else {
      const discount = (subtotal * voucher.value) / 100;
      return voucher.maxDiscount ? Math.min(discount, voucher.maxDiscount) : discount;
    }
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount());
  };

  return (
    <POSContext.Provider
      value={{
        orderItems,
        customer,
        voucher,
        paymentMethod,
        addOrderItem,
        removeOrderItem,
        updateOrderItem,
        clearOrder,
        setCustomer,
        setVoucher,
        setPaymentMethod,
        getSubtotal,
        getDiscount,
        getTotal,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
