/**
 * Validation utilities for form inputs
 */

export const isValidPhone = (phone: string): boolean => {
  // Vietnamese phone number format: 10 digits starting with 0
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0;
};

export const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidVoucherCode = (code: string): boolean => {
  // Voucher code should be 3-20 uppercase letters/numbers
  const voucherRegex = /^[A-Z0-9]{3,20}$/;
  return voucherRegex.test(code);
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: 0xxx xxx xxx
  if (phone.length === 10) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  return phone;
};

export const sanitizeInput = (input: string): string => {
  // Remove potential XSS characters
  return input.replace(/[<>]/g, '');
};
