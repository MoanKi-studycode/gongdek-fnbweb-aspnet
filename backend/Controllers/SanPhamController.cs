using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API read-only sản phẩm — nền tảng hiển thị dữ liệu.</summary>
[ApiController]
[Route("api/san-pham")]
[AllowAnonymous]
public class SanPhamController : ControllerBase
{
    private readonly ISanPhamService _service;

    public SanPhamController(ISanPhamService service)
    {
        _service = service;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    [HttpGet]
    public async Task<ActionResult<List<SanPhamDto>>> GetAll([FromQuery] int? maDanhMuc)
    {
        return Ok(await _service.GetAllAsync(maDanhMuc));
    }
}
