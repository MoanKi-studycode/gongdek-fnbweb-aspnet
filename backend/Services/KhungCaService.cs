using GongDek_Nhom20.DTOs.ShiftDtos;
using GongDek_Nhom20.Repositories;

namespace GongDek_Nhom20.Services;

/// <summary>Xử lý nghiệp vụ khung ca làm việc.</summary>
public class KhungCaService : IKhungCaService
{
    private readonly IKhungCaRepository _repository;

    public KhungCaService(IKhungCaRepository repository)
    {
        _repository = repository;
    }

    #region Quản lý khung ca

    public async Task<List<KhungCaDto>> GetActiveAsync()
    {
        var items = await _repository.GetActiveAsync();
        return items.Select(k => new KhungCaDto
        {
            MaKhungCa = k.MaKhungCa,
            TenCa = k.TenCa,
            GioBatDau = k.GioBatDau,
            GioKetThuc = k.GioKetThuc,
            TrangThai = k.TrangThai,
        }).ToList();
    }

    #endregion
}
