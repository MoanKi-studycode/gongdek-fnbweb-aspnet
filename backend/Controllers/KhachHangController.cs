using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GongDek_Nhom20.Controllers;

/// <summary>API quản lý thông tin khách hàng thành viên (CRUD) - Hoài Phương phụ trách.</summary>
[ApiController]
[Route("api/khach-hang")]
[Authorize(Policy = "NoiBo")] // Chỉ nhân viên quán mới có quyền xem/sửa thông tin khách hàng
public class KhachHangController : ControllerBase
{
    // LƯU Ý : tạo thêm IKhachHangService sau.
    
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(new List<object>
        {
            new { MaKH = 1, HoTen = "Nguyễn Văn A", SoDienThoai = "0901234567", DiemTichLuy = 150 },
            new { MaKH = 2, HoTen = "Trần Thị B", SoDienThoai = "0987654321", DiemTichLuy = 50 }
        });
    }

    /// <summary>POST /api/khach-hang — Tạo mới một khách hàng thành viên khi họ đến mua tại quầy.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] object dataKhachHang)
    {
        return StatusCode(StatusCodes.Status201Created, new { 
            Success = true, 
            Message = "Đăng ký thành viên khách hàng mới thành công!" 
        });
    }

    /// <summary>PUT /api/khach-hang/{id} — Cập nhật thông tin khách hàng (Sửa số điện thoại, cập nhật điểm tích lũy).</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] object dataCapNhat)
    {
        return Ok(new { Success = true, Message = $"Cập nhật thông tin khách hàng số {id} thành công." });
    }

    /// <summary>DELETE /api/khach-hang/{id} — Xóa thông tin khách hàng (hoặc khóa tài khoản).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        return Ok(new { Success = true, Message = $"Đã xóa dữ liệu khách hàng số {id} ra khỏi danh sách tích điểm." });
    }
}