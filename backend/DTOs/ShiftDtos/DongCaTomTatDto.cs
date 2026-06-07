namespace GongDek_Nhom20.DTOs.ShiftDtos;

/// <summary>Tóm tắt doanh thu ca trước khi đóng — dùng đối soát tiền mặt.</summary>
public class DongCaTomTatDto
{
    public int MaCa { get; set; }
    public decimal TienQuyDauCa { get; set; }
    public decimal TongTienMatTrongCa { get; set; }
    public decimal TienMatKyVong { get; set; }
    public int SoHoaDonTienMat { get; set; }
    public int TongSoHoaDon { get; set; }
}
