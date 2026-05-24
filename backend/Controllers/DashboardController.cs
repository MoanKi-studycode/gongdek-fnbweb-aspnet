using GongDek_Nhom20.DTOs.DashboardDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API dashboard và báo cáo tổng quan — phụ trách: Trần Anh Tín.</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = "QuanLy")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    #region Dashboard quản trị

    /// <summary>GET /api/dashboard/tong-quan — dữ liệu tổng hợp cho trang dashboard.</summary>
    [HttpGet("tong-quan")]
    public async Task<ActionResult<DashboardTongQuanDto>> GetTongQuan()
    {
        var result = await _dashboardService.GetTongQuanAsync();
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/doanh-thu — tổng doanh thu theo khoảng thời gian.</summary>
    [HttpGet("doanh-thu")]
    public async Task<ActionResult<DoanhThuThongKeDto>> GetDoanhThu(
        [FromQuery] DateOnly? tuNgay,
        [FromQuery] DateOnly? denNgay)
    {
        var result = await _dashboardService.GetDoanhThuAsync(tuNgay, denNgay);
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/don-hom-nay — thống kê đơn hàng hôm nay.</summary>
    [HttpGet("don-hom-nay")]
    public async Task<ActionResult<DonHomNayDto>> GetDonHomNay()
    {
        var result = await _dashboardService.GetDonHomNayAsync();
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/top-san-pham — top sản phẩm bán chạy.</summary>
    [HttpGet("top-san-pham")]
    public async Task<ActionResult<List<TopSanPhamDto>>> GetTopSanPham(
        [FromQuery] int limit = 5,
        [FromQuery] DateOnly? tuNgay = null,
        [FromQuery] DateOnly? denNgay = null)
    {
        var result = await _dashboardService.GetTopSanPhamAsync(limit, tuNgay, denNgay);
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/don-online-cho-xac-nhan — đơn online chờ xử lý.</summary>
    [HttpGet("don-online-cho-xac-nhan")]
    public async Task<ActionResult<List<DonOnlineChoDto>>> GetDonOnlineChoXacNhan(
        [FromQuery] int limit = 10)
    {
        var result = await _dashboardService.GetDonOnlineChoXacNhanAsync(limit);
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/canh-bao-nguyen-lieu — nguyên liệu sắp hết.</summary>
    [HttpGet("canh-bao-nguyen-lieu")]
    public async Task<ActionResult<List<NguyenLieuCanhBaoDto>>> GetCanhBaoNguyenLieu(
        [FromQuery] int limit = 10)
    {
        var result = await _dashboardService.GetCanhBaoNguyenLieuAsync(limit);
        return Ok(result);
    }

    #endregion
}
