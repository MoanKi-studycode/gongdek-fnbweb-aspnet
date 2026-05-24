import { apiClient } from './apiClient';
import type { InventoryItem, StockIn, StockInStatus, Supplier, InventoryStatus } from '@/types';

export type { InventoryItem, StockIn, StockInStatus, Supplier, InventoryStatus };

// TODO [Trần Quốc Tiên]: Hoàn thiện API /api/nguyen-lieu, /api/phieu-nhap-kho

/** Gọi API danh sách nguyên liệu */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    return await apiClient.get<InventoryItem[]>('/nguyen-lieu');
  } catch {
    return [];
  }
}

/** Gọi API danh sách phiếu nhập kho */
export async function getStockInRecords(): Promise<StockIn[]> {
  try {
    return await apiClient.get<StockIn[]>('/phieu-nhap-kho');
  } catch {
    return [];
  }
}

/** Gọi API danh sách nhà cung cấp */
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    return await apiClient.get<Supplier[]>('/nha-cung-cap');
  } catch {
    return [];
  }
}

/** Nhãn trạng thái phiếu nhập */
export function getStockInStatusLabel(status: StockInStatus): string {
  const labels: Record<StockInStatus, string> = {
    CHO_DUYET: 'Chờ duyệt',
    DA_DUYET: 'Đã duyệt',
    HOAN_THANH: 'Hoàn thành',
    HUY: 'Đã hủy',
  };
  return labels[status];
}

/** Màu badge trạng thái phiếu nhập */
export function getStockInStatusColor(status: StockInStatus): string {
  const colors: Record<StockInStatus, string> = {
    CHO_DUYET: 'bg-orange-100 text-orange-700',
    DA_DUYET: 'bg-blue-100 text-blue-700',
    HOAN_THANH: 'bg-green-100 text-green-700',
    HUY: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}

/** Tính trạng thái tồn kho nguyên liệu */
export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.currentStock <= 0) return 'Hết hàng';
  if (item.currentStock <= item.minStock) return 'Sắp hết';
  return 'Đủ hàng';
}

/** Lọc nguyên liệu sắp hết */
export function getLowStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.currentStock <= item.minStock);
}
