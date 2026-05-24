namespace GongDek_Nhom20.Helpers;

/// <summary>Đường dẫn lưu và phục vụ ảnh sản phẩm — dùng chung cho module CRUD.</summary>
public static class ProductImagePaths
{
    /// <summary>URL tương đối (lưu vào SanPham.HinhAnh).</summary>
    public const string UrlPrefix = "/images/products/";

    /// <summary>Thư mục con trong wwwroot.</summary>
    public const string StorageSubFolder = "images/products";

    public static string BuildUrl(int maSanPham, string extension = "jpg")
    {
        var ext = extension.TrimStart('.');
        return $"{UrlPrefix}{maSanPham}.{ext}";
    }

    public static string BuildUrl(string fileName)
    {
        var safe = Path.GetFileName(fileName);
        return $"{UrlPrefix}{safe}";
    }

    public static string GetPhysicalDirectory(IWebHostEnvironment env)
        => Path.Combine(env.WebRootPath, StorageSubFolder);

    public static string GetPhysicalPath(IWebHostEnvironment env, int maSanPham, string extension = "jpg")
        => Path.Combine(GetPhysicalDirectory(env), $"{maSanPham}.{extension.TrimStart('.')}");

    public static void EnsureStorageDirectory(IWebHostEnvironment env)
    {
        var dir = GetPhysicalDirectory(env);
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);
    }
}
