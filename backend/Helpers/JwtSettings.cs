namespace GongDek_Nhom20.Helpers;

/// <summary>Cấu hình JWT đọc từ appsettings.json.</summary>
public class JwtSettings
{
    public string Key { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpiresInMinutes { get; set; } = 480;
}
