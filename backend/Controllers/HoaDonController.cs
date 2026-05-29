using GongDek_Nhom20.DTOs.OrderReadDtos;
using GongDek_Nhom20.Services;
using GongDek_Nhom20.Services.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/hoa-don")]
[Authorize(Policy = "NoiBo")]
public class HoaDonController : ControllerBase
{
    private readonly IHoaDonReadService _service;
    private readonly IPdfExportService _pdfExportService;

    public HoaDonController(IHoaDonReadService service, IPdfExportService pdfExportService)
    {
        _service = service;
        _pdfExportService = pdfExportService;
    }

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

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> ExportPdf(int id)
    {
        var detail = await _service.GetByIdAsync(id);
        var bytes = _pdfExportService.ExportHoaDon(detail);
        var fileName = $"HoaDon_GongDek_{id}_{DateTime.Now:yyyyMMdd}.pdf";
        return File(bytes, "application/pdf", fileName);
    }
}
