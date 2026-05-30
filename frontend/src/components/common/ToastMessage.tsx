import { toast } from 'sonner';

/** Thông báo chuẩn hóa cho toàn hệ thống GongDek */
export const toastMessages = {
  createSuccess: 'Thêm dữ liệu thành công.',
  updateSuccess: 'Cập nhật dữ liệu thành công.',
  deleteSuccess: 'Xóa dữ liệu thành công.',
  lockSuccess: 'Khóa tài khoản thành công.',
  unlockSuccess: 'Mở khóa tài khoản thành công.',
  orderSuccess: 'Đặt hàng thành công.',
  closeShiftSuccess: 'Đóng ca thành công.',
  openShiftSuccess: 'Mở ca thành công.',
  exportSuccess: 'Xuất báo cáo thành công.',
  loadFailed: 'Không thể tải dữ liệu. Vui lòng thử lại.',
  saveFailed: 'Không thể lưu dữ liệu. Vui lòng kiểm tra thông tin nhập.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  genericError: 'Có lỗi xảy ra trong quá trình xử lý.',
} as const;

const TECHNICAL_PATTERNS = [
  /^undefined$/i,
  /^null$/i,
  /network error/i,
  /failed to fetch/i,
  /axioserror/i,
  /\[object object\]/i,
];

function isTechnicalMessage(message: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message.trim()));
}

/** Chuyển lỗi API/runtime thành thông báo thân thiện với người dùng */
export function getErrorMessage(
  err: unknown,
  fallback = toastMessages.genericError,
): string {
  if (import.meta.env.DEV) {
    console.error(err);
  }

  if (!(err instanceof Error)) {
    return fallback;
  }

  const message = err.message.trim();
  if (!message || isTechnicalMessage(message)) {
    return fallback;
  }

  if (message.includes('401') || /unauthorized|hết hạn|expired/i.test(message)) {
    return toastMessages.sessionExpired;
  }

  if (message.includes('403') || /forbidden|không có quyền/i.test(message)) {
    return toastMessages.forbidden;
  }

  if (/không kết nối được api|không thể kết nối/i.test(message)) {
    return 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend và thử lại.';
  }

  return message;
}

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyError(err: unknown, fallback?: string): void {
  toast.error(getErrorMessage(err, fallback ?? toastMessages.genericError));
}

export function notifyInfo(message: string): void {
  toast.info(message);
}

export function notifyWarning(message: string): void {
  toast.warning(message);
}
