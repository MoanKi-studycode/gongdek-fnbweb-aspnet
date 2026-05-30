# Security Audit Report — GongDek Tea & Coffee

**Ngày kiểm tra:** 24/05/2026  
**Phạm vi:** Toàn bộ repository local + remote GitLab `moanki-studycode-group/GongDek`

---

## Security Audit

### Đã kiểm tra

| Khu vực | Nội dung quét |
|---------|----------------|
| **Backend** (`.cs`, `appsettings*.json`) | JWT Key, Connection String, SMTP, hardcoded password |
| **Frontend** (`src/`, `.env*`) | API key, JWT secret, DB password, embedded token |
| **README.md** | Secret lộ trong tài liệu |
| **database/** | `schema.sql`, `seed.sql` — plain password, token, API key |
| **Toàn repo** | `Placeholder`, `Mock`, `Fake`, `SeedData`, GitLab token |

**Từ khóa đã grep:** `Secret`, `Password`, `Key`, `Token`, `ConnectionString`, `API Key`, `Bearer`, `SMTP`, `gitlab`, `GongDek_JWT`, `Admin@123`, `100000.` (hash prefix).

### Kết quả phát hiện

| Mức | Vị trí | Mô tả | Trạng thái |
|-----|--------|-------|------------|
| **HIGH** | `backend/appsettings.json` | JWT secret `GongDek_JWT_SecretKey_2026_Min32Chars!` hardcode trong file commit Git | **Đã sửa** — chuyển sang `appsettings.Development.json` (gitignore) |
| **MEDIUM** | Git history | JWT secret từng nằm trong `appsettings.json` (commit `2d50c89`, `9534f02`, `8d027ee`) | **Cần xử lý** — xem [Remaining Issues](#remaining-issues) |
| **LOW** | `KhachHangService.cs` | Mật khẩu mặc định `Khachhang@123` khi admin tạo KH không nhập mật khẩu | **Chấp nhận** — hành vi demo, hash trước khi lưu DB |
| **INFO** | `README.md` | Plain text mật khẩu tài khoản demo | **Chấp nhận** — chỉ dùng dev, không phải production secret |
| **OK** | Frontend | Chỉ `VITE_API_BASE_URL`; token JWT lấy runtime qua API | Không có secret embed |
| **OK** | SMTP / GitLab token / API key bên thứ 3 | Không tìm thấy | — |
| **OK** | `SeedData.cs` | Không tồn tại | Seed chỉ qua SQL |

### Đã sửa

1. **`appsettings.json`** — chỉ cấu trúc + giá trị rỗng (không secret).
2. **`appsettings.Development.json`** — chứa connection string local + JWT key cho dev.
3. **`appsettings.example.json`** — mẫu với placeholder `YOUR_*`.
4. **`Program.cs`** — validate `ConnectionStrings:DefaultConnection` và `Jwt:Key` khi khởi động; từ chối placeholder.
5. **`.gitignore`** — bổ sung `backend/appsettings.Development.json`, `.env.local`, `.env.production`.
6. **`README.md`** — thêm mục **Security Configuration** và hướng dẫn copy example → Development.

---

## Configuration

### File cấu hình đã chuẩn hóa

| File | Commit Git? | Mục đích |
|------|-------------|----------|
| `backend/appsettings.json` | Có | Cấu trúc chung, không secret |
| `backend/appsettings.example.json` | Có | Mẫu cho dev mới clone |
| `backend/appsettings.Development.json` | **Không** (gitignore) | Secret local |
| `frontend/.env.example` | Có | `VITE_API_BASE_URL=/api` |
| `frontend/.env` | **Không** (gitignore) | Override local |

### Biến môi trường production (khuyến nghị)

```text
ConnectionStrings__DefaultConnection=<connection-string>
Jwt__Key=<secret-min-32-chars>
Jwt__Issuer=GongDekAPI
Jwt__Audience=GongDekFrontend
```

### `.gitignore` đã xác nhận / bổ sung

- `backend/appsettings.Development.json`
- `frontend/.env`, `.env`, `.env.local`, `.env.production`
- Giữ `!backend/appsettings.example.json`, `!frontend/.env.example`

---

## GitLab

### Repository

| Mục | Giá trị |
|-----|---------|
| **Remote** | `https://gitlab.com/moanki-studycode-group/GongDek.git` |
| **URL nhóm (spec)** | `https://gitlab.com/moanki-studycode-group/gongdek` (cùng project, khác hoa thường path) |
| **Visibility** | Không xác minh qua API công khai (404) — **khả năng cao là Private** ✓ |
| **Branch hiện tại** | `main` (ahead origin 1 commit) |

### Branch

| Branch | Ghi chú |
|--------|---------|
| `main` | Branch chính |
| `feature/tin-cleanup-docs` | Trần Anh Tín |
| `feature/hoaiphuong-complete` / `feature/hoaiphuong-pos` | Hoài Phương |
| `review-tran-quoc-tien` / `tran-quoc-tien` | Quốc Tiên |
| `QuocTienModulePlaceholder` | **Không tồn tại** ✓ |
| `HoaiPhuongModulePlaceholder` | **Không tồn tại** ✓ |

### Secret trong lịch sử Git

- `backend/appsettings.json` từng chứa JWT key thật trong ít nhất 3 commit.
- Khuyến nghị: đổi JWT key production; nếu repo từng public, cân nhắc `git filter-repo` / rotate credential.

**Lệnh gợi ý khi commit lần tới (ngừng track Development.json):**

```powershell
git rm --cached backend/appsettings.Development.json
```

---

## Database

### `schema.sql`

| Kiểm tra | Kết quả |
|----------|---------|
| Plain password | Không |
| Token / API key | Không |
| Dữ liệu seed lẫn trong schema | Không |

### `seed.sql`

| Kiểm tra | Kết quả |
|----------|---------|
| Mật khẩu plain text | Không — chỉ `MatKhauHash` (ASP.NET Identity style `100000.*`) |
| Email cá nhân nhạy cảm | Không — email demo `@gmail.com`, `@gongdek.vn` |
| Token / API key | Không |
| Tài khoản demo | `admin`, `nhanvien`, `khachhang@gongdek.vn` + hash tương ứng |

**Mật khẩu demo (plain, chỉ README):** `Admin@123`, `Nhanvien@123`, `Khachhang@123`

### `SeedData.cs`

- Không tồn tại trong project — không có seed C# dư thừa.

---

## Cleanup

### File đã xóa (audit này)

| File | Lý do |
|------|-------|
| `backend/Helpers/.gitkeep` | Placeholder Phase 3 — thư mục đã có code thật |
| `backend/DTOs/.gitkeep` | Placeholder |
| `backend/Repositories/.gitkeep` | Placeholder |
| `backend/Middlewares/.gitkeep` | Placeholder |
| `backend/Services/.gitkeep` | Placeholder |

### File đã xóa (session trước, xác nhận)

| File / thư mục | Lý do |
|----------------|-------|
| `scripts/` (gồm `sync-product-images.ps1`) | Upload qua admin API |
| `database/seed_catalog_demo.sql` | Gộp vào `seed.sql` |
| `database/README.md` | Gom README root |

### Code đã refactor / dọn

| Thay đổi | Chi tiết |
|----------|----------|
| Config backend | Secret tách khỏi `appsettings.json` |
| `Program.cs` | Fail-fast khi thiếu config |
| `DashboardPage.tsx` | Xóa TODO cũ (link kho đã có) |
| `.gitignore` | Chuẩn hóa ignore secret |

### Không tìm thấy / không xóa

- Mock service, fake repository, placeholder class nghiệp vụ — không có.
- `GONGDEK_AGENT_PLAN.md` — đã gitignore, không trong working tree.

---

## Remaining Issues

1. **JWT trong Git history** — Secret cũ vẫn có thể đọc từ commit cũ. **Hành động:** rotate `Jwt:Key` trên môi trường deploy; cân nhắc rewrite history nếu repo từng public.
2. **`appsettings.Development.json` đang tracked** — Sau lần commit kế tiếp, chạy `git rm --cached backend/appsettings.Development.json` để gitignore có hiệu lực trên remote.
3. **Mật khẩu mặc định tạo KH** (`Khachhang@123` trong `KhachHangService`) — Chấp nhận cho demo; production nên bắt buộc admin nhập mật khẩu hoặc gửi email reset.
4. **GitLab visibility** — Cần xác nhận thủ công trên GitLab UI (Settings → General → Visibility) vì API không truy cập được không token.
5. **Tài khoản demo trong README** — Không dùng trên production; đổi mật khẩu sau khi deploy.

---

## Cấu trúc thư mục sau audit

```text
GongDek_Nhom20/
├── README.md
├── .gitignore
├── docs/
│   └── SecurityAuditReport.md
├── backend/
│   ├── appsettings.json              # không secret
│   ├── appsettings.example.json      # mẫu
│   ├── appsettings.Development.json  # local only (gitignore)
│   └── wwwroot/images/products/
├── frontend/
│   ├── .env.example
│   └── src/
└── database/
    ├── schema.sql
    └── seed.sql
```

---

## Build verification

- `dotnet build` (backend): **OK**
- Không thay đổi database schema.
- Không thay đổi nghiệp vụ hệ thống.
