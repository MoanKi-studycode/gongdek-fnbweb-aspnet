using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/nguyen-lieu")]
public class NguyenLieuController : ControllerBase
{
    private readonly INguyenLieuService _service;

    public NguyenLieuController(INguyenLieuService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<NguyenLieuDto>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] string? trangThai = null,
        [FromQuery] bool? canhBao = null)
    {
        return Ok(await _service.GetAllAsync(search, trangThai, canhBao));
    }

    [HttpGet("canh-bao-ton-kho")]
    [AllowAnonymous]
    public async Task<ActionResult<List<NguyenLieuDto>>> GetCanhBaoTonKho()
    {
        return Ok(await _service.GetCanhBaoTonKhoAsync());
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<NguyenLieuDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(new { message = "Không tìm thấy nguyên liệu." });

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<NguyenLieuDto>> Create([FromBody] CreateNguyenLieuDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.MaNL }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
   [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<NguyenLieuDto>> Update(int id, [FromBody] UpdateNguyenLieuDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "Không tìm thấy nguyên liệu." });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}/dieu-chinh-ton")]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<NguyenLieuDto>> DieuChinhTonKho(int id, [FromBody] DieuChinhTonKhoDto dto)
    {
        try
        {
            var result = await _service.DieuChinhTonKhoAsync(id, dto);
            if (result == null) return NotFound(new { message = "Không tìm thấy nguyên liệu." });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy nguyên liệu." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
