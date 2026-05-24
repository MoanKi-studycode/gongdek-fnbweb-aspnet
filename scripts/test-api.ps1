# GongDek API smoke test — chạy khi backend đang listen tại http://localhost:5256
# Khởi động backend: cd backend && dotnet run --launch-profile http
param(
    [string]$BaseUrl = "http://localhost:5256/api"
)

$ErrorActionPreference = "Stop"
$passed = 0
$failed = 0

function Write-Result($name, $ok, $detail = "") {
    if ($ok) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
        $script:passed++
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
        if ($detail) { Write-Host "       $detail" -ForegroundColor Yellow }
        $script:failed++
    }
}

function Invoke-Login($body) {
    $json = $body | ConvertTo-Json -Compress
    return Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $json -ContentType "application/json"
}

function Invoke-AuthGet($path, $token) {
    return Invoke-RestMethod -Uri "$BaseUrl$path" -Method Get -Headers @{ Authorization = "Bearer $token" }
}

Write-Host "`n=== GongDek API Smoke Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n"

# --- Đăng nhập từng role (QuanLy, NhanVien, KhachHang) ---
$accounts = @(
    @{ Name = "QuanLy";    Body = @{ tenDangNhap = "admin"; matKhau = "Admin@123" } },
    @{ Name = "NhanVien";  Body = @{ tenDangNhap = "nhanvien"; matKhau = "Nhanvien@123" } },
    @{ Name = "KhachHang"; Body = @{ email = "khachhang@gongdek.vn"; matKhau = "Khachhang@123" } }
)

$tokens = @{}

foreach ($acc in $accounts) {
    try {
        $res = Invoke-Login $acc.Body
        $roleOk = $res.user.vaiTro -eq $acc.Name
        Write-Result "Login $($acc.Name)" $roleOk "user=$($res.user.hoTen), role=$($res.user.vaiTro)"
        if ($roleOk) { $tokens[$acc.Name] = $res.token }
    } catch {
        $detail = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $detail = $reader.ReadToEnd()
            } catch { }
        }
        Write-Result "Login $($acc.Name)" $false $detail
    }
}

# --- /auth/me ---
foreach ($role in $tokens.Keys) {
    try {
        $me = Invoke-AuthGet "/auth/me" $tokens[$role]
        Write-Result "GET /auth/me ($role)" ($me.vaiTro -eq $role)
    } catch {
        Write-Result "GET /auth/me ($role)" $false $_.Exception.Message
    }
}

# --- Phân quyền QuanLy-only ---
$adminToken = $tokens["QuanLy"]
$nhanVienToken = $tokens["NhanVien"]

if ($adminToken) {
    try {
        $nv = Invoke-AuthGet "/nhan-vien" $adminToken
        Write-Result "GET /nhan-vien (QuanLy)" ($nv -is [array]) "count=$($nv.Count)"
    } catch {
        Write-Result "GET /nhan-vien (QuanLy)" $false $_.Exception.Message
    }

    try {
        $dash = Invoke-AuthGet "/dashboard/tong-quan" $adminToken
        Write-Result "GET /dashboard/tong-quan" ($null -ne $dash.doanhThuHomNay)
    } catch {
        Write-Result "GET /dashboard/tong-quan" $false $_.Exception.Message
    }

    try {
        $khungCa = Invoke-AuthGet "/khung-ca" $adminToken
        Write-Result "GET /khung-ca" ($khungCa.Count -ge 0) "count=$($khungCa.Count)"
    } catch {
        Write-Result "GET /khung-ca" $false $_.Exception.Message
    }
}

if ($nhanVienToken) {
    try {
        Invoke-AuthGet "/nhan-vien" $nhanVienToken | Out-Null
        Write-Result "GET /nhan-vien (NhanVien bị chặn)" $false "Unexpected 200 OK"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Result "GET /nhan-vien (NhanVien bị chặn)" ($code -in 401, 403) "HTTP $code"
    }
}

if (-not $adminToken) {
    Write-Result "Phân quyền admin APIs" $false "Không có token QuanLy"
}

# --- Tóm tắt ---
Write-Host "`n=== Kết quả: $passed passed, $failed failed ===" -ForegroundColor Cyan
if ($failed -gt 0) { exit 1 }
