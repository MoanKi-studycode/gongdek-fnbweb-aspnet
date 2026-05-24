using GongDek_Nhom20.DTOs.CatalogDtos;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

/// <summary>API read-only size — nền tảng hiển thị dữ liệu.</summary>
[ApiController]
[Route("api/size")]
[AllowAnonymous]
public class SizeController : ControllerBase
{
    private readonly ISizeService _service;

    public SizeController(ISizeService service)
    {
        _service = service;
    }

  // API read-only tối thiểu để frontend hiển thị dữ liệu thật.
  // TODO [Trần Quốc Tiên]: Hoàn thiện CRUD và nghiệp vụ quản lý sản phẩm sau.
    [HttpGet]
    public async Task<ActionResult<List<SizeDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }
}
