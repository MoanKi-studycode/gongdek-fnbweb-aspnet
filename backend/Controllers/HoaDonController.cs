using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API read-only hóa đơn — nền tảng hiển thị dữ liệu.</summary>
[ApiController]
[Route("api/hoa-don")]
[Authorize(Policy = "NoiBo")]
public class HoaDonController : ControllerBase
{
    private readonly IHoaDonReadService _service;

    public HoaDonController(IHoaDonReadService service)
    {
        _service = service;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Nguyễn Hoài Phương]: Hoàn thiện nghiệp vụ hóa đơn / đơn online sau.
    [HttpGet]
    public async Task<ActionResult<List<HoaDonListDto>>> GetAll(
        [FromQuery] string? trangThai,
        [FromQuery] DateOnly? tuNgay,
        [FromQuery] DateOnly? denNgay)
    {
        return Ok(await _service.GetAllAsync(trangThai, tuNgay, denNgay));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<HoaDonDetailDto>> GetById(int id)
    {
        return Ok(await _service.GetByIdAsync(id));
    }
}
