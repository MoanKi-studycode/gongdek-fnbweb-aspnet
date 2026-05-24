/** returnUrl an toàn cho redirect sau đăng nhập/đăng ký. */
export function safeReturnUrl(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export function authPathWithReturn(
  path: '/auth/login' | '/auth/register',
  returnUrl?: string | null,
): string {
  const safe = safeReturnUrl(returnUrl ?? null);
  if (!safe) return path;
  return `${path}?returnUrl=${encodeURIComponent(safe)}`;
}
