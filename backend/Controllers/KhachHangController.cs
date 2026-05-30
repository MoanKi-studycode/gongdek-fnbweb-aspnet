using GongDek_Nhom20.DTOs.KhachHangDtos;
using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/khach-hang")]
public class KhachHangController : ControllerBase
{
    private readonly IKhachHangService _service;
    private readonly IHoaDonReadService _hoaDonReadService;

    public KhachHangController(IKhachHangService service, IHoaDonReadService hoaDonReadService)
    {
        _service = service;
        _hoaDonReadService = hoaDonReadService;
    }

    [HttpGet("me")]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<KhachHangDto>> GetMe()
    {
        var maKh = User.GetCustomerId();
        return Ok(await _service.GetProfileAsync(maKh));
    }

    [HttpGet("me/hoa-don")]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<List<HoaDonListDto>>> GetMyInvoices([FromQuery] int? limit)
    {
        var maKh = User.GetCustomerId();
        return Ok(await _hoaDonReadService.GetByKhachHangAsync(maKh, limit));
    }

    [HttpGet("me/hoa-don/{id:int}")]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<HoaDonDetailDto>> GetMyInvoiceById(int id)
    {
        try
        {
            var maKh = User.GetCustomerId();
            return Ok(await _hoaDonReadService.GetByIdForKhachHangAsync(maKh, id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy hóa đơn." });
        }
    }

    [HttpGet]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<List<KhachHangDto>>> GetAll([FromQuery] string? search)
    {
        return Ok(await _service.GetAllAsync(search));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<KhachHangDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy khách hàng." }) : Ok(result);
    }

    [HttpGet("phone/{phone}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<KhachHangDto>> GetByPhone(string phone)
    {
        var result = await _service.GetByPhoneAsync(phone);
        return result == null ? NotFound(new { message = "Không tìm thấy khách hàng." }) : Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<KhachHangDto>> Create([FromBody] CreateKhachHangDto dto)
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
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<KhachHangDto>> Update(int id, [FromBody] UpdateKhachHangDto dto)
    {
        try
        {
            return Ok(await _service.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy khách hàng." });
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
            await _service.DeleteAsync(id);
            return Ok(new { message = "Đã khóa khách hàng." });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Không tìm thấy khách hàng." });
        }
    }
}
