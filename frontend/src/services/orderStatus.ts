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

const POS_INVOICE_STATUS_LABELS: Record<string, string> = {
  HoanThanh: 'Hoàn thành',
  ChoPhaChe: 'Đang pha chế',
  DaThanhToan: 'Đã thanh toán',
  ChoThanhToan: 'Chờ thanh toán',
  DaHuy: 'Đã hủy',
};

const POS_INVOICE_STATUS_COLORS: Record<string, string> = {
  HoanThanh: 'bg-green-100 text-green-700',
  ChoPhaChe: 'bg-blue-100 text-blue-700',
  DaThanhToan: 'bg-teal-100 text-teal-700',
  ChoThanhToan: 'bg-orange-100 text-orange-700',
  DaHuy: 'bg-gray-100 text-gray-700',
};

/** Nhãn trạng thái đơn hiển thị cho khách hàng */
export function getCustomerOrderStatus(invoice: {
  loaiDon?: 'Online' | 'TaiQuay';
  orderStatus?: OrderStatus;
  invoiceStatus?: string;
}): { label: string; color: string } {
  if (invoice.loaiDon === 'Online' && invoice.orderStatus) {
    return {
      label: getOrderStatusLabel(invoice.orderStatus),
      color: getOrderStatusColor(invoice.orderStatus),
    };
  }

  const status = invoice.invoiceStatus ?? 'HoanThanh';
  return {
    label: POS_INVOICE_STATUS_LABELS[status] ?? status,
    color: POS_INVOICE_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700',
  };
}

export function isOrderInProgress(invoice: {
  loaiDon?: 'Online' | 'TaiQuay';
  orderStatus?: OrderStatus;
  invoiceStatus?: string;
}): boolean {
  if (invoice.loaiDon === 'Online' && invoice.orderStatus) {
    return ['CHO_XAC_NHAN', 'DANG_XU_LY', 'DANG_GIAO'].includes(invoice.orderStatus);
  }
  const status = invoice.invoiceStatus ?? '';
  return status === 'ChoPhaChe' || status === 'ChoThanhToan' || status === 'DaThanhToan';
}

export function isOrderCompleted(invoice: {
  loaiDon?: 'Online' | 'TaiQuay';
  orderStatus?: OrderStatus;
  invoiceStatus?: string;
}): boolean {
  if (invoice.loaiDon === 'Online' && invoice.orderStatus) {
    return invoice.orderStatus === 'HOAN_THANH';
  }
  return invoice.invoiceStatus === 'HoanThanh';
}
