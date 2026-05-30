using GongDek_Nhom20.DTOs.DanhGiaDtos;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/danh-gia")]
public class DanhGiaController : ControllerBase
{
    private readonly IDanhGiaService _service;

    public DanhGiaController(IDanhGiaService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<List<DanhGiaDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("tom-tat")]
    [AllowAnonymous]
    public async Task<ActionResult<List<DanhGiaTomTatDto>>> GetAllSummaries()
    {
        return Ok(await _service.GetAllSummariesAsync());
    }

    [HttpGet("san-pham/{maSanPham:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<DanhGiaDto>>> GetBySanPham(int maSanPham)
    {
        return Ok(await _service.GetBySanPhamAsync(maSanPham));
    }

    [HttpGet("san-pham/{maSanPham:int}/tom-tat")]
    [AllowAnonymous]
    public async Task<ActionResult<DanhGiaTomTatDto>> GetSummaryBySanPham(int maSanPham)
    {
        var summary = await _service.GetSummaryBySanPhamAsync(maSanPham);
        return summary == null ? NotFound(new { message = "Chưa có đánh giá." }) : Ok(summary);
    }

    [HttpGet("hoa-don/{maHoaDon:int}")]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<List<DanhGiaDto>>> GetByHoaDon(int maHoaDon)
    {
        var user = JwtHelper.GetUserFromClaims(User);
        if (user == null)
            return Unauthorized();

        return Ok(await _service.GetByHoaDonForCustomerAsync(user.Id, maHoaDon));
    }

    [HttpPost]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<DanhGiaDto>> Create([FromBody] CreateDanhGiaDto dto)
    {
        var user = JwtHelper.GetUserFromClaims(User);
        if (user == null)
            return Unauthorized();

        try
        {
            var result = await _service.CreateAsync(user.Id, dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
