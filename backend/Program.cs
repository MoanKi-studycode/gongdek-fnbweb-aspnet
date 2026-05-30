using System.Text;
using GongDek_Nhom20.Data;
using GongDek_Nhom20.Helpers;
using GongDek_Nhom20.Middlewares;
using GongDek_Nhom20.Repositories;
using GongDek_Nhom20.Services;
using GongDek_Nhom20.Services.Export;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

#region Cấu hình cơ sở dữ liệu

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Thiếu ConnectionStrings:DefaultConnection. Sao chép appsettings.example.json sang appsettings.Development.json và cấu hình.");
}

builder.Services.AddDbContext<GongDekDbContext>(options =>
    options.UseSqlServer(connectionString));

#endregion

#region Cấu hình JWT xác thực

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INhanVienRepository, NhanVienRepository>();
builder.Services.AddScoped<INhanVienService, NhanVienService>();
builder.Services.AddScoped<IKhungCaRepository, KhungCaRepository>();
builder.Services.AddScoped<IKhungCaService, KhungCaService>();
builder.Services.AddScoped<ICaLamViecRepository, CaLamViecRepository>();
builder.Services.AddScoped<ICaLamViecService, CaLamViecService>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IBaoCaoRepository, BaoCaoRepository>();
builder.Services.AddScoped<IBaoCaoService, BaoCaoService>();
builder.Services.AddScoped<IExcelExportService, ExcelExportService>();
builder.Services.AddScoped<IPdfExportService, PdfExportService>();
builder.Services.AddScoped<IDanhMucService, DanhMucService>();
builder.Services.AddScoped<ISanPhamService, SanPhamService>();
builder.Services.AddScoped<ISizeService, SizeService>();
builder.Services.AddScoped<IToppingService, ToppingService>();
builder.Services.AddScoped<INhaCungCapService, NhaCungCapService>();
builder.Services.AddScoped<INguyenLieuService, NguyenLieuService>();
builder.Services.AddScoped<IPhieuNhapKhoService, PhieuNhapKhoService>();
builder.Services.AddScoped<IHoaDonReadService, HoaDonReadService>();
builder.Services.AddScoped<IDonHangOnlineReadService, DonHangOnlineReadService>();
builder.Services.AddScoped<IDonHangOnlineWriteService, DonHangOnlineWriteService>();
builder.Services.AddScoped<IKhachHangService, KhachHangService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IDanhGiaService, DanhGiaService>();

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Thiếu cấu hình Jwt trong appsettings.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key)
    || jwtSettings.Key.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "Thiếu Jwt:Key hợp lệ. Cấu hình trong appsettings.Development.json hoặc biến môi trường Jwt__Key.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("QuanLy", policy => policy.RequireRole("QuanLy"));
    options.AddPolicy("NhanVien", policy => policy.RequireRole("NhanVien"));
    options.AddPolicy("KhachHang", policy => policy.RequireRole("KhachHang"));
    options.AddPolicy("NoiBo", policy => policy.RequireRole("QuanLy", "NhanVien"));
});

#endregion

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

ProductImagePaths.EnsureStorageDirectory(app.Environment);

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
