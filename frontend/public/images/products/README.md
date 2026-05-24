# Ảnh sản phẩm

Thư mục lưu file ảnh hiển thị trên web (Vite phục vụ tại `/images/products/...`).

## Quy ước đặt tên

| Cách | Ví dụ `SanPham.HinhAnh` | File |
|------|-------------------------|------|
| Theo mã SP (khuyến nghị) | `/images/products/1.jpg` | `1.jpg` |
| Tên file tùy chỉnh | `/images/products/tra-sua-tran-chau.webp` | `tra-sua-tran-chau.webp` |

Định dạng: `.jpg`, `.jpeg`, `.png`, `.webp`.

## CRUD sản phẩm (Trần Quốc Tiên)

1. Upload/lưu file vào `frontend/public/images/products/` **và** `backend/wwwroot/images/products/` (cùng tên file).
2. Ghi `HinhAnh` trong DB = đường dẫn URL công khai, ví dụ `/images/products/{maSanPham}.jpg`.
3. Frontend đọc qua `resolveProductImageUrl()` trong `src/lib/productImage.ts`.

API upload (khi có): lưu vào `backend/wwwroot/images/products/`, trả về path `/images/products/...`.
