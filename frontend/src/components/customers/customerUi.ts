export function formatCustomerPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function getMemberLevelColor(level: string): string {
  const colors: Record<string, string> = {
    Bạc: 'bg-gray-100 text-gray-700',
    Vàng: 'bg-yellow-100 text-yellow-700',
    'Kim cương': 'bg-blue-100 text-blue-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
}

export function getCustomerStatusLabel(status?: string): string {
  switch (status) {
    case 'HoatDong':
      return 'Đang hoạt động';
    case 'Khoa':
      return 'Đã khóa';
    default:
      return status ?? '—';
  }
}
