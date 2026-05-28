using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GongDek_Nhom20.Controllers;

/// <summary>API quản lý Đánh giá và Phản hồi sản phẩm từ Khách hàng - Hoài Phương phụ trách.</summary>
[ApiController]
[Route("api/danh-gia")]
public class DanhGiaController : ControllerBase
{
    /// <summary>GET /api/danh-gia/san-pham/{maSanPham} — Ai cũng có thể xem đánh giá của món ăn công khai.</summary>
    [HttpGet("san-pham/{maSanPham:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySanPham(int maSanPham)
    {
        return Ok(new List<object>
        {
            new { MaDanhGia = 101, NguoiDung = "Khách giấu tên", SoSao = 5, BinhLuan = "Trà sữa GongDek ngon tuyệt vời, trân châu mềm dẻo!" },
            new { MaDanhGia = 102, NguoiDung = "Hoài Phương", SoSao = 4, BinhLuan = "Vị vừa uống, giao hàng nhanh." }
        });
    }

    /// <summary>POST /api/danh-gia — Chỉ khách đã mua hàng (KhachHang) mới được quyền viết đánh giá 
    [HttpPost]
    [Authorize(Policy = "KhachHang")]
    public async Task<IActionResult> Create([FromBody] object dataDanhGia)
    {
        return StatusCode(StatusCodes.Status201Created, new { 
            Success = true, 
            Message = "Gửi đánh giá sản phẩm của bạn thành công. Cảm ơn bạn đã phản hồi!" 
        });
    }
}