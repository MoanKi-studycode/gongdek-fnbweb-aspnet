using System.Security.Cryptography;

namespace GongDek_Nhom20.Helpers;

/// <summary>Mã hóa và xác minh mật khẩu bằng PBKDF2 + salt.</summary>
public static class PasswordHashHelper
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    #region Mã hóa mật khẩu

    /// <summary>Hash mật khẩu — không lưu plain text.</summary>
    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            KeySize);

        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    /// <summary>Kiểm tra mật khẩu người dùng nhập với hash đã lưu.</summary>
    public static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 3)
            return false;

        if (!int.TryParse(parts[0], out var iterations))
            return false;

        var salt = Convert.FromBase64String(parts[1]);
        var expectedHash = Convert.FromBase64String(parts[2]);

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    /// <summary>Kiểm tra độ mạnh mật khẩu tối thiểu.</summary>
    public static bool IsPasswordStrongEnough(string password)
    {
        if (password.Length < 8)
            return false;

        var hasUpper = password.Any(char.IsUpper);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecial = password.Any(ch => !char.IsLetterOrDigit(ch));

        return hasUpper && hasDigit && hasSpecial;
    }

    #endregion
}
