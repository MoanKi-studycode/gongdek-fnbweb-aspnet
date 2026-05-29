using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.DTOs.OrderWrite;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

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

    [HttpPost]
    [Authorize(Policy = "KhachHang")]
    public async Task<ActionResult<CreateDonHangOnlineResultDto>> Create([FromBody] CreateDonHangOnlineDto dto)
    {
        try
        {
            var result = await _writeService.CreateAsync(User, dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("pos-checkout")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<CreateDonHangOnlineResultDto>> PosCheckout([FromBody] PosCheckoutDto dto)
    {
        try
        {
            var result = await _writeService.PosCheckoutAsync(User, dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}/update-status")]
    [Authorize(Policy = "NoiBo")]
    public async Task<IActionResult> UpdateWorkflowStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var ok = await _writeService.UpdateStatusAsync(User, id, dto.TrangThai, dto.LyDoHuy);
            if (!ok)
                return NotFound(new { message = $"Không tìm thấy đơn hàng #{id}." });

            return Ok(new { message = $"Đã cập nhật trạng thái đơn #{id} thành {dto.TrangThai}." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/cancel")]
    [Authorize(Policy = "NoiBo")]
    public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderDto dto)
    {
        try
        {
            var ok = await _writeService.CancelAsync(User, id, dto);
            if (!ok)
                return NotFound(new { message = $"Không tìm thấy đơn hàng #{id}." });

            return Ok(new { message = $"Đã hủy đơn hàng #{id}.", trangThai = "DaHuy" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
