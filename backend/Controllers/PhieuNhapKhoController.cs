using GongDek_Nhom20.DTOs.InventoryDtos;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GongDek_Nhom20.Controllers;

[ApiController]
[Route("api/phieu-nhap-kho")]
public class PhieuNhapKhoController : ControllerBase
{
    private readonly IPhieuNhapKhoService _service;

    public PhieuNhapKhoController(IPhieuNhapKhoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PhieuNhapKhoDto>>> GetAll(
        [FromQuery] string? trangThai = null,
        [FromQuery] int? maNCC = null,
        [FromQuery] DateOnly? tuNgay = null,
        [FromQuery] DateOnly? denNgay = null)
    {
        var data = await _service.GetAllAsync(trangThai, maNCC, tuNgay, denNgay);
        return Ok(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PhieuNhapKhoDto>> GetById(int id)
    {
        var data = await _service.GetByIdAsync(id);
        return data == null ? NotFound(new { message = "Không tìm thấy phiếu nhập kho." }) : Ok(data);
    }

    [HttpPost]
    //[Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<PhieuNhapKhoDto>> Create([FromBody] CreatePhieuNhapKhoDto dto)
    {
        var user = JwtHelper.GetUserFromClaims(User);
        var result = await _service.CreateAsync(dto, user?.Id);
        return CreatedAtAction(nameof(GetById), new { id = result.MaPhieuNhap }, result);
    }

    [HttpPut("{id:int}")]
    //[Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<PhieuNhapKhoDto>> Update(int id, [FromBody] UpdatePhieuNhapKhoDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    [HttpPut("{id:int}/huy")]
    //[Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<PhieuNhapKhoDto>> Cancel(int id, [FromBody] UpdateTrangThaiPhieuNhapDto dto)
    {
        var result = await _service.CancelAsync(id, dto.GhiChu);
        return Ok(result);
    }



    [HttpPut("{id:int}/duyet")]
    [Authorize(Policy = "QuanLy")]
    public async Task<ActionResult<PhieuNhapKhoDto>> Approve(int id, [FromBody] UpdateTrangThaiPhieuNhapDto dto)
    {
        var user = JwtHelper.GetUserFromClaims(User);
        var result = await _service.ApproveAsync(id, user?.Id, dto.GhiChu);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "QuanLy")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
