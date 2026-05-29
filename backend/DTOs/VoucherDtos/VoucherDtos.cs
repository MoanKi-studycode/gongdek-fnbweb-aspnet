namespace GongDek_Nhom20.DTOs.VoucherDtos;

public class VoucherDto
{
    public int MaVoucher { get; set; }
    public string MaCode { get; set; } = null!;
    public string? MoTa { get; set; }
    public string LoaiGiam { get; set; } = "SO_TIEN";
    public decimal GiaTriGiam { get; set; }
    public decimal? DonHangToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
    public string TrangThai { get; set; } = null!;
}

public class CreateVoucherDto
{
    public string MaCode { get; set; } = null!;
    public string? MoTa { get; set; }
    public string LoaiGiam { get; set; } = "SO_TIEN";
    public decimal GiaTriGiam { get; set; }
    public decimal? DonHangToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public DateOnly NgayBatDau { get; set; }
    public DateOnly NgayKetThuc { get; set; }
}

public class UpdateVoucherDto : CreateVoucherDto
{
    public string? TrangThai { get; set; }
}
