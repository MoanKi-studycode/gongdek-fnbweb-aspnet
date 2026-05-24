using GongDek_Nhom20.DTOs.ShiftDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API ca làm việc — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/ca-lam-viec")]
[Authorize(Policy = "QuanLy")]
public class CaLamViecController : ControllerBase
{
    private readonly ICaLamViecService _caLamViecService;

    public CaLamViecController(ICaLamViecService caLamViecService)
    {
        _caLamViecService = caLamViecService;
    }

    #region Quản lý ca làm việc

    /// <summary>GET /api/ca-lam-viec — lịch sử ca (lọc theo ngày, NV, khung ca, trạng thái).</summary>
    [HttpGet]
    public async Task<ActionResult<List<CaLamViecDto>>> GetHistory(
        [FromQuery] DateOnly? tuNgay,
        [FromQuery] DateOnly? denNgay,
        [FromQuery] int? maNV,
        [FromQuery] int? maKhungCa,
        [FromQuery] string? trangThaiCa)
    {
        var result = await _caLamViecService.GetHistoryAsync(tuNgay, denNgay, maNV, maKhungCa, trangThaiCa);
        return Ok(result);
    }

    /// <summary>GET /api/ca-lam-viec/dang-mo — danh sách ca đang mở.</summary>
    [HttpGet("dang-mo")]
    public async Task<ActionResult<List<CaLamViecDto>>> GetDangMo()
    {
        var result = await _caLamViecService.GetDangMoAsync();
        return Ok(result);
    }

    /// <summary>GET /api/ca-lam-viec/{id} — chi tiết ca làm việc.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CaLamViecDto>> GetById(int id)
    {
        var result = await _caLamViecService.GetByIdAsync(id);
        return Ok(result);
    }

    /// <summary>POST /api/ca-lam-viec/mo-ca — mở ca làm việc mới.</summary>
    [HttpPost("mo-ca")]
    public async Task<ActionResult<CaLamViecDto>> MoCa([FromBody] MoCaDto dto)
    {
        var result = await _caLamViecService.MoCaAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.MaCa }, result);
    }

    /// <summary>PUT /api/ca-lam-viec/{id}/dong-ca — đóng ca làm việc.</summary>
    [HttpPut("{id:int}/dong-ca")]
    public async Task<ActionResult<CaLamViecDto>> DongCa(int id, [FromBody] DongCaDto dto)
    {
        var result = await _caLamViecService.DongCaAsync(id, dto);
        return Ok(result);
    }

    #endregion
}
