using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/san-pham")]
public class SanPhamController : ControllerBase
{
    private readonly ISanPhamService _service;

    public SanPhamController(ISanPhamService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<SanPhamDto>>> GetAll([FromQuery] int? maDanhMuc, [FromQuery] string? search)
    {
        return Ok(await _service.GetAllAsync(maDanhMuc, search));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<SanPhamDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm." }) : Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<SanPhamDto>> Create([FromBody] CreateSanPhamDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.MaSanPham }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<SanPhamDto>> Update(int id, [FromBody] UpdateSanPhamDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);
            return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm." }) : Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound(new { message = "Không tìm thấy sản phẩm." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
