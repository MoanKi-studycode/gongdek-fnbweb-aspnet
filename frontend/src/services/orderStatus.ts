import type { OrderStatus } from '@/types/modules';

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    CHO_XAC_NHAN: 'Chờ xác nhận',
    DANG_XU_LY: 'Đang xử lý',
    DANG_GIAO: 'Đang giao',
    HOAN_THANH: 'Hoàn thành',
    DA_HUY: 'Đã hủy',
  };
  return labels[status];
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    CHO_XAC_NHAN: 'bg-orange-100 text-orange-700',
    DANG_XU_LY: 'bg-blue-100 text-blue-700',
    DANG_GIAO: 'bg-purple-100 text-purple-700',
    HOAN_THANH: 'bg-green-100 text-green-700',
    DA_HUY: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}
