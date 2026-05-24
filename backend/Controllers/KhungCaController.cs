using GongDek_Nhom20.DTOs.ShiftDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API khung ca làm việc — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/khung-ca")]
[Authorize(Policy = "QuanLy")]
public class KhungCaController : ControllerBase
{
    private readonly IKhungCaService _khungCaService;

    public KhungCaController(IKhungCaService khungCaService)
    {
        _khungCaService = khungCaService;
    }

    #region Quản lý khung ca

    /// <summary>GET /api/khung-ca — danh sách khung ca đang hoạt động.</summary>
    [HttpGet]
    public async Task<ActionResult<List<KhungCaDto>>> GetAll()
    {
        var result = await _khungCaService.GetActiveAsync();
        return Ok(result);
    }

    #endregion
}
