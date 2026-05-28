using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.DTOs.OrderWrite;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        dto.LoaiDonHang = "Online"; // Định danh luồng đơn đặt từ App/Web khách hàng
        var result = await _writeService.CreateAsync(User, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    
    // Bổ Sung


    /// <summary>POST /api/don-hang-online/pos-checkout — Nhân viên tạo đơn và thanh toán trực tiếp tại quầy.</summary>
    [HttpPost("pos-checkout")]
    [Authorize(Policy = "NoiBo")]
    public async Task<ActionResult<CreateDonHangOnlineResultDto>> PosCheckout([FromBody] CreateDonHangOnlineDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Dữ liệu đơn hàng tại quầy không hợp lệ.");
        }

        
        dto.LoaiDonHang = "TaiQuay"; 

        
        var result = await _writeService.CreateAsync(User, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    
    [HttpPut("{id:int}/update-status")]
    [Authorize(Policy = "NoiBo")]
    public async Task<IActionResult> UpdateWorkflowStatus(int id, [FromBody] string trangThaiMoi)
    {
        if (string.IsNullOrEmpty(trangThaiMoi))
        {
            return BadRequest("Trạng thái mới không được để trống.");
        }

        
        var result = await _writeService.UpdateStatusAsync(id, trangThaiMoi);
        
        if (!result)
        {
            return NotFound($"Không tìm thấy đơn hàng mã số {id} hoặc cập nhật thất bại.");
        }

        return Ok(new { 
            message = $"Đơn hàng mã số {id} đã được nhân viên cập nhật trạng thái sang: {trangThaiMoi} thành công." 
        });
    }

    /// <summary>POST /api/don-hang-online/{id}/cancel — Hủy đơn hàng và xử lý hoàn nguyên (nếu có).</summary>
    [HttpPost("{id:int}/cancel")]
    [Authorize(Policy = "NoiBo")]
    public async Task<IActionResult> CancelOrder(int id, [FromBody] string lyDoHuy)
    {
        if (string.IsNullOrEmpty(lyDoHuy))
        {
            return BadRequest("Lý do hủy đơn không được để trống.");
        }

        // bổ sung 
        var result = await _writeService.UpdateStatusAsync(id, "DaHuy", lyDoHuy);

        if (!result)
        {
            return NotFound($"Không tìm thấy đơn hàng mã số {id} để tiến hành hủy.");
        }

        return Ok(new { 
            message = $"Đã hủy đơn hàng số {id} thành công.", 
            lyDo = lyDoHuy,
            trangThai = "DaHuy" 
        });
    }
}