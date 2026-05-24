using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.DTOs.OrderWrite;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API đơn hàng online — đọc (nội bộ) và đặt hàng (khách hàng).</summary>
[ApiController]
[Route("api/don-hang-online")]
public class DonHangOnlineController : ControllerBase
{
    private readonly IDonHangOnlineReadService _readService;
    private readonly IDonHangOnlineWriteService _writeService;

    public DonHangOnlineController(
        IDonHangOnlineReadService readService,
        IDonHangOnlineWriteService writeService)
    {
        _readService = readService;
        _writeService = writeService;
    }

    [HttpGet]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<List<DonHangOnlineListDto>>> GetAll([FromQuery] string? trangThai)
    {
        return Ok(await _readService.GetAllAsync(trangThai));
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<DonHangOnlineDetailDto>> GetById(int id)
    {
        return Ok(await _readService.GetByIdAsync(id));
    }

    /// <summary>POST /api/don-hang-online — khách đặt hàng; MaKH lấy từ token.</summary>
    [HttpPost]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<CreateDonHangOnlineResultDto>> Create([FromBody] CreateDonHangOnlineDto dto)
    {
        var result = await _writeService.CreateAsync(User, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
