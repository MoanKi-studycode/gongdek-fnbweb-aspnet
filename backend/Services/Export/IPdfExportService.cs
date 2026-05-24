using GongDek_Nhom20.DTOs.BaoCaoDtos;

namespace GongDek_Nhom20.Services.Export;

public interface IPdfExportService
{
    byte[] ExportBaoCaoDoanhThu(BaoCaoDoanhThuTongHopDto data);
}
