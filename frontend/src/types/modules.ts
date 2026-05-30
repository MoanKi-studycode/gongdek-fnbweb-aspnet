/** Kiểu dữ liệu module — dùng chung, không chứa mock data */

export type OrderStatus = 'CHO_XAC_NHAN' | 'DANG_XU_LY' | 'DANG_GIAO' | 'HOAN_THANH' | 'DA_HUY';

export interface OnlineOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    productName: string;
    size: string;
    toppings: string[];
    notes: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  customerName: string;
  customerPhone: string;
  employeeName: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    toppings: string[];
    notes: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản' | 'Ví điện tử';
  createdAt: string;
  loaiDon?: 'Online' | 'TaiQuay';
  orderStatus?: OrderStatus;
  invoiceStatus?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  memberLevel: 'Bạc' | 'Vàng' | 'Kim cương';
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: 'PHAN_TRAM' | 'SO_TIEN';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  status: 'ConHieuLuc' | 'HetHan';
}

export interface ProductReview {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  userName: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

export interface ProductReviewSummary {
  productId: string;
  count: number;
  averageRating: number;
}

export type InventoryUnit = 'kg' | 'lít' | 'gói' | 'hộp' | 'chai' | 'cái';
export type InventoryStatus = 'Đủ hàng' | 'Sắp hết' | 'Hết hàng';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: InventoryUnit;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

export type StockInStatus = 'CHO_DUYET' | 'DA_DUYET' | 'HUY';

export interface StockInItem {
  inventoryId: string;
  inventoryName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockIn {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  items: StockInItem[];
  totalAmount: number;
  status: StockInStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}
