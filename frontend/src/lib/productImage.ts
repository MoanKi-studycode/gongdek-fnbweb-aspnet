/** URL công khai ảnh sản phẩm — khớp frontend/public và backend/wwwroot. */
export const PRODUCT_IMAGE_URL_PREFIX = '/images/products';

const DEFAULT_PRODUCT_IMAGE = `${PRODUCT_IMAGE_URL_PREFIX}/default.jpg`;

/**
 * Chuẩn hóa HinhAnh từ API hoặc fallback theo maSanPham.
 * DB nên lưu dạng: /images/products/{maSanPham}.jpg
 */
export function resolveProductImageUrl(
  hinhAnh?: string | null,
  maSanPham?: number,
): string {
  const raw = hinhAnh?.trim();
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
      return raw;
    }
    return `${PRODUCT_IMAGE_URL_PREFIX}/${raw}`;
  }

  if (maSanPham != null && maSanPham > 0) {
    return `${PRODUCT_IMAGE_URL_PREFIX}/${maSanPham}.jpg`;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/** Gợi ý path lưu DB sau khi upload file {maSanPham}.{extension}. */
export function buildProductImageDbPath(maSanPham: number, extension = 'jpg'): string {
  const ext = extension.replace(/^\./, '');
  return `${PRODUCT_IMAGE_URL_PREFIX}/${maSanPham}.${ext}`;
}
