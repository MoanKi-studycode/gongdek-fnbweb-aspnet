using GongDek_Nhom20.DTOs.VoucherDtos;
using GongDek_Nhom20.Models;

namespace GongDek_Nhom20.Services;

public interface IVoucherService
{
    Task<List<VoucherDto>> GetAllAsync();
    Task<VoucherDto?> GetByCodeAsync(string code);
    Task<VoucherDto?> GetByIdAsync(int id);
    Task<VoucherDto> CreateAsync(CreateVoucherDto dto);
    Task<VoucherDto> UpdateAsync(int id, UpdateVoucherDto dto);
    Task DeleteAsync(int id);
    Task<Voucher?> ResolveValidVoucherAsync(string? maCode, decimal tongTienMon);
}
