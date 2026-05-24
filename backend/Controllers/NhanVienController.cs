using GongDek_Nhom20.DTOs.EmployeeDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API quản lý nhân viên — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/nhan-vien")]
[Authorize(Policy = "QuanLy")]
public class NhanVienController : ControllerBase
{
    private readonly INhanVienService _nhanVienService;

    public NhanVienController(INhanVienService nhanVienService)
    {
        _nhanVienService = nhanVienService;
    }

    #region Quản lý nhân viên

    /// <summary>GET /api/nhan-vien — danh sách nhân viên (tìm kiếm, lọc vai trò).</summary>
    [HttpGet]
    public async Task<ActionResult<List<NhanVienDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? maVaiTro)
    {
        var result = await _nhanVienService.GetAllAsync(search, maVaiTro);
        return Ok(result);
    }

    /// <summary>GET /api/nhan-vien/vai-tro — danh sách vai trò nhân viên cho form.</summary>
    [HttpGet("vai-tro")]
    public async Task<ActionResult<List<VaiTroDto>>> GetVaiTro()
    {
        var result = await _nhanVienService.GetVaiTroNhanVienAsync();
        return Ok(result);
    }

    /// <summary>GET /api/nhan-vien/{id} — chi tiết nhân viên.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<NhanVienDto>> GetById(int id)
    {
        var result = await _nhanVienService.GetByIdAsync(id);
        return Ok(result);
    }

    /// <summary>POST /api/nhan-vien — thêm nhân viên mới.</summary>
    [HttpPost]
    public async Task<ActionResult<NhanVienDto>> Create([FromBody] CreateNhanVienDto dto)
    {
        var result = await _nhanVienService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.MaNV }, result);
    }

    /// <summary>PUT /api/nhan-vien/{id} — cập nhật thông tin nhân viên.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<NhanVienDto>> Update(int id, [FromBody] UpdateNhanVienDto dto)
    {
        var result = await _nhanVienService.UpdateAsync(id, dto);
        return Ok(result);
    }

    /// <summary>PUT /api/nhan-vien/{id}/khoa — khóa tài khoản nhân viên.</summary>
    [HttpPut("{id:int}/khoa")]
    public async Task<ActionResult<NhanVienDto>> Lock(int id)
    {
        var result = await _nhanVienService.LockAsync(id);
        return Ok(result);
    }

    /// <summary>PUT /api/nhan-vien/{id}/mo-khoa — mở khóa tài khoản nhân viên.</summary>
    [HttpPut("{id:int}/mo-khoa")]
    public async Task<ActionResult<NhanVienDto>> Unlock(int id)
    {
        var result = await _nhanVienService.UnlockAsync(id);
        return Ok(result);
    }

    #endregion
}
