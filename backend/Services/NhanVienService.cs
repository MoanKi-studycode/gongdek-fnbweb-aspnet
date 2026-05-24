using GongDek_Nhom20.DTOs.EmployeeDtos;
using GongDek_Nhom20.Enums;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Models;
using GongDek_Nhom20.Repositories;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý nghiệp vụ quản lý nhân viên.</summary>
public class NhanVienService : INhanVienService
{
    private readonly INhanVienRepository _repository;

    private static readonly string[] AllowedRoles =
    {
        TenVaiTro.QuanLy,
        TenVaiTro.NhanVien,
    };

    public NhanVienService(INhanVienRepository repository)
    {
        _repository = repository;
    }

    #region Quản lý nhân viên

    public async Task<List<NhanVienDto>> GetAllAsync(string? search, int? maVaiTro)
    {
        var items = await _repository.GetAllAsync(search, maVaiTro);
        return items.Select(MapToDto).ToList();
    }

    public async Task<NhanVienDto> GetByIdAsync(int id)
    {
        var nhanVien = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");

        return MapToDto(nhanVien);
    }

    public async Task<List<VaiTroDto>> GetVaiTroNhanVienAsync()
    {
        var roles = await _repository.GetVaiTroNhanVienAsync();
        return roles.Select(r => new VaiTroDto
        {
            MaVaiTro = r.MaVaiTro,
            TenVaiTro = r.TenVaiTro,
            MoTa = r.MoTa,
        }).ToList();
    }

    public async Task<NhanVienDto> CreateAsync(CreateNhanVienDto dto)
    {
        await ValidateVaiTroAsync(dto.MaVaiTro);
        await ValidateUniqueAsync(dto.TenDangNhap, dto.SoDienThoai);

        if (!PasswordHashHelper.IsPasswordStrongEnough(dto.MatKhau))
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.");

        var nhanVien = new NhanVien
        {
            HoTen = dto.HoTen.Trim(),
            SoDienThoai = string.IsNullOrWhiteSpace(dto.SoDienThoai) ? null : dto.SoDienThoai.Trim(),
            NgaySinh = dto.NgaySinh,
            GioiTinh = dto.GioiTinh,
            DiaChi = dto.DiaChi,
            TenDangNhap = dto.TenDangNhap.Trim(),
            MatKhauHash = PasswordHashHelper.HashPassword(dto.MatKhau),
            MaVaiTro = dto.MaVaiTro,
            TrangThai = TrangThaiNhanVien.HoatDong,
            NgayTao = DateTime.UtcNow,
        };

        await _repository.AddAsync(nhanVien);
        await _repository.SaveChangesAsync();

        var created = await _repository.GetByIdAsync(nhanVien.MaNV)
            ?? throw new InvalidOperationException("Không thể tải nhân viên vừa tạo.");

        return MapToDto(created);
    }

    public async Task<NhanVienDto> UpdateAsync(int id, UpdateNhanVienDto dto)
    {
        var nhanVien = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");

        await ValidateVaiTroAsync(dto.MaVaiTro);
        await ValidateUniqueAsync(nhanVien.TenDangNhap, dto.SoDienThoai, id);

        if (!string.IsNullOrWhiteSpace(dto.MatKhau))
        {
            if (!PasswordHashHelper.IsPasswordStrongEnough(dto.MatKhau))
                throw new InvalidOperationException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.");

            nhanVien.MatKhauHash = PasswordHashHelper.HashPassword(dto.MatKhau);
        }

        nhanVien.HoTen = dto.HoTen.Trim();
        nhanVien.SoDienThoai = string.IsNullOrWhiteSpace(dto.SoDienThoai) ? null : dto.SoDienThoai.Trim();
        nhanVien.NgaySinh = dto.NgaySinh;
        nhanVien.GioiTinh = dto.GioiTinh;
        nhanVien.DiaChi = dto.DiaChi;
        nhanVien.MaVaiTro = dto.MaVaiTro;

        await _repository.SaveChangesAsync();

        var updated = await _repository.GetByIdAsync(id)
            ?? throw new InvalidOperationException("Không thể tải nhân viên vừa cập nhật.");

        return MapToDto(updated);
    }

    public async Task<NhanVienDto> LockAsync(int id)
    {
        var nhanVien = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");

        if (nhanVien.TrangThai == TrangThaiNhanVien.Khoa)
            throw new InvalidOperationException("Tài khoản đã bị khóa.");

        nhanVien.TrangThai = TrangThaiNhanVien.Khoa;
        await _repository.SaveChangesAsync();

        return MapToDto(nhanVien);
    }

    public async Task<NhanVienDto> UnlockAsync(int id)
    {
        var nhanVien = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");

        if (nhanVien.TrangThai == TrangThaiNhanVien.HoatDong)
            throw new InvalidOperationException("Tài khoản đang hoạt động.");

        nhanVien.TrangThai = TrangThaiNhanVien.HoatDong;
        await _repository.SaveChangesAsync();

        return MapToDto(nhanVien);
    }

    #endregion

    #region Hàm hỗ trợ nội bộ

    private async Task ValidateVaiTroAsync(int maVaiTro)
    {
        var vaiTro = await _repository.GetVaiTroByIdAsync(maVaiTro)
            ?? throw new InvalidOperationException("Vai trò không tồn tại.");

        if (!AllowedRoles.Contains(vaiTro.TenVaiTro))
            throw new InvalidOperationException("Vai trò không hợp lệ cho nhân viên.");
    }

    private async Task ValidateUniqueAsync(string tenDangNhap, string? soDienThoai, int? excludeMaNv = null)
    {
        if (await _repository.ExistsTenDangNhapAsync(tenDangNhap.Trim(), excludeMaNv))
            throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

        if (!string.IsNullOrWhiteSpace(soDienThoai) &&
            await _repository.ExistsSoDienThoaiAsync(soDienThoai.Trim(), excludeMaNv))
            throw new InvalidOperationException("Số điện thoại đã được sử dụng.");
    }

    private static NhanVienDto MapToDto(NhanVien nhanVien)
    {
        return new NhanVienDto
        {
            MaNV = nhanVien.MaNV,
            HoTen = nhanVien.HoTen,
            SoDienThoai = nhanVien.SoDienThoai,
            NgaySinh = nhanVien.NgaySinh,
            GioiTinh = nhanVien.GioiTinh,
            DiaChi = nhanVien.DiaChi,
            TenDangNhap = nhanVien.TenDangNhap,
            MaVaiTro = nhanVien.MaVaiTro,
            TenVaiTro = nhanVien.VaiTro.TenVaiTro,
            TrangThai = nhanVien.TrangThai,
            NgayTao = nhanVien.NgayTao,
        };
    }

    #endregion
}
