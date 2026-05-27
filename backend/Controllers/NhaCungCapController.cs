using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/nha-cung-cap")]
public class NhaCungCapController : ControllerBase
{
    private readonly INhaCungCapService _service;

    public NhaCungCapController(INhaCungCapService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<NhaCungCapDto>>> GetAll([FromQuery] string? search = null)
    {
        return Ok(await _service.GetAllAsync(search));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<NhaCungCapDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(new { message = "Không tìm thấy nhà cung cấp." });

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<NhaCungCapDto>> Create([FromBody] CreateNhaCungCapDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.MaNCC }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<NhaCungCapDto>> Update(int id, [FromBody] UpdateNhaCungCapDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "Không tìm thấy nhà cung cấp." });

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
            if (!success) return NotFound(new { message = "Không tìm thấy nhà cung cấp." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
