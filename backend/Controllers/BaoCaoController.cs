using GongDek_Nhom20.Services;
using GongDek_Nhom20.Services.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API báo cáo và xuất file — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/bao-cao")]
[Authorize(Policy = "QuanLy")]
public class BaoCaoController : ControllerBase
{
    private readonly IBaoCaoService _baoCaoService;
    private readonly IExcelExportService _excelExportService;
    private readonly IPdfExportService _pdfExportService;

    public BaoCaoController(
        IBaoCaoService baoCaoService,
        IExcelExportService excelExportService,
        IPdfExportService pdfExportService)
    {
        _baoCaoService = baoCaoService;
        _excelExportService = excelExportService;
        _pdfExportService = pdfExportService;
    }

    #region Xuất báo cáo doanh thu

    /// <summary>GET /api/bao-cao/doanh-thu/excel — xuất báo cáo doanh thu Excel.</summary>
    [HttpGet("doanh-thu/excel")]
    public async Task<IActionResult> ExportDoanhThuExcel([FromQuery] DateOnly? tuNgay, [FromQuery] DateOnly? denNgay)
    {
        var data = await _baoCaoService.GetBaoCaoDoanhThuAsync(tuNgay, denNgay);
        var bytes = _excelExportService.ExportBaoCaoDoanhThu(data);
        var fileName = $"BaoCaoDoanhThu_GongDek_{DateTime.Now:yyyyMMdd}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    /// <summary>GET /api/bao-cao/doanh-thu/pdf — xuất báo cáo doanh thu PDF.</summary>
    [HttpGet("doanh-thu/pdf")]
    public async Task<IActionResult> ExportDoanhThuPdf([FromQuery] DateOnly? tuNgay, [FromQuery] DateOnly? denNgay)
    {
        var data = await _baoCaoService.GetBaoCaoDoanhThuAsync(tuNgay, denNgay);
        var bytes = _pdfExportService.ExportBaoCaoDoanhThu(data);
        var fileName = $"BaoCaoDoanhThu_GongDek_{DateTime.Now:yyyyMMdd}.pdf";
        return File(bytes, "application/pdf", fileName);
    }

    #endregion
}
