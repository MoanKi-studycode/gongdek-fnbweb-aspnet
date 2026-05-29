public interface IDonHangOnlineWriteService
{
    Task<CreateDonHangOnlineResultDto> CreateAsync(ClaimsPrincipal principal, CreateDonHangOnlineDto dto);

    // Hàm cập nhật trạng thái trả về Task<bool>
    Task<bool> UpdateStatusAsync(int id, string trangThaiMoi, string? lyDoHuy = null);
}