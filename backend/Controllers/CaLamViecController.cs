using GongDek_Nhom20.DTOs.ShiftDtos;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API ca làm việc — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/ca-lam-viec")]
[Authorize]
public class CaLamViecController : ControllerBase
{
    private readonly ICaLamViecService _caLamViecService;

    public CaLamViecController(ICaLamViecService caLamViecService)
    {
        _caLamViecService = caLamViecService;
    }

    /// <summary>GET /api/ca-lam-viec — lịch sử ca (Quản lý: tất cả; Nhân viên: chỉ ca của mình).</summary>
    [HttpGet]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<List<CaLamViecDto>>> GetHistory(
        [FromQuery] DateOnly? tuNgay,
        [FromQuery] DateOnly? denNgay,
        [FromQuery] int? maNV,
        [FromQuery] int? maKhungCa,
        [FromQuery] string? trangThaiCa)
    {
        if (!User.IsQuanLy())
            maNV = User.GetStaffId();

        var result = await _caLamViecService.GetHistoryAsync(tuNgay, denNgay, maNV, maKhungCa, trangThaiCa);
        return Ok(result);
    }

    /// <summary>GET /api/ca-lam-viec/dang-mo — ca đang mở (Nhân viên chỉ thấy ca của mình).</summary>
    [HttpGet("dang-mo")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<List<CaLamViecDto>>> GetDangMo()
    {
        var maNv = User.IsQuanLy() ? (int?)null : User.GetStaffId();
        var result = await _caLamViecService.GetDangMoAsync(maNv);
        return Ok(result);
    }

    /// <summary>GET /api/ca-lam-viec/{id} — chi tiết ca làm việc.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<CaLamViecDto>> GetById(int id)
    {
        var result = await _caLamViecService.GetByIdAsync(id);
        if (!User.IsQuanLy() && result.MaNV != User.GetStaffId())
            return Forbid();
        return Ok(result);
    }

    /// <summary>GET /api/ca-lam-viec/{id}/tom-tat-dong-ca — tóm tắt tiền mặt trước khi đóng ca.</summary>
    [HttpGet("{id:int}/tom-tat-dong-ca")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<DongCaTomTatDto>> GetDongCaTomTat(int id)
    {
        var existing = await _caLamViecService.GetByIdAsync(id);
        if (!User.IsQuanLy() && existing.MaNV != User.GetStaffId())
            return Forbid();

        try
        {
            return Ok(await _caLamViecService.GetDongCaTomTatAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy ca làm việc." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>POST /api/ca-lam-viec/mo-ca — mở ca (Nhân viên chỉ mở ca cho chính mình).</summary>
    [HttpPost("mo-ca")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<CaLamViecDto>> MoCa([FromBody] MoCaDto dto)
    {
        if (!User.IsQuanLy())
            dto.MaNV = User.GetStaffId();

        var result = await _caLamViecService.MoCaAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.MaCa }, result);
    }

    /// <summary>PUT /api/ca-lam-viec/{id}/dong-ca — đóng ca.</summary>
    [HttpPut("{id:int}/dong-ca")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<CaLamViecDto>> DongCa(int id, [FromBody] DongCaDto dto)
    {
        var existing = await _caLamViecService.GetByIdAsync(id);
        if (!User.IsQuanLy() && existing.MaNV != User.GetStaffId())
            return Forbid();

        var result = await _caLamViecService.DongCaAsync(id, dto);
        return Ok(result);
    }
}
