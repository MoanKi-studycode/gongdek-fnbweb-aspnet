using GongDek_Nhom20.DTOs.VoucherDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/voucher")]
public class VoucherController : ControllerBase
{
    private readonly IVoucherService _service;

    public VoucherController(IVoucherService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<List<VoucherDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("code/{code}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<VoucherDto>> GetByCode(string code)
    {
        var result = await _service.GetByCodeAsync(code);
        return result == null ? NotFound(new { message = "Không tìm thấy voucher." }) : Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<VoucherDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy voucher." }) : Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<VoucherDto>> Create([FromBody] CreateVoucherDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<VoucherDto>> Update(int id, [FromBody] UpdateVoucherDto dto)
    {
        try
        {
            return Ok(await _service.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy voucher." });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return Ok(new { message = "Đã vô hiệu hóa voucher." });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy voucher." });
        }
    }
}
