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

    [HttpGet("san-pham/{maSanPham:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<DanhGiaDto>>> GetBySanPham(int maSanPham)
    {
        return Ok(await _service.GetBySanPhamAsync(maSanPham));
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
