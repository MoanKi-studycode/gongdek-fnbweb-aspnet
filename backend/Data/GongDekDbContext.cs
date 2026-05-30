using GongDek_Nhom20.Models;
using Microsoft.EntityFrameworkCore;

namespace GongDek_Nhom20.Data;

public class GongDekDbContext : DbContext
{
    public GongDekDbContext(DbContextOptions<GongDekDbContext> options)
        : base(options)
    {
    }

    public DbSet<VaiTro> VaiTros => Set<VaiTro>();
    public DbSet<NhanVien> NhanViens => Set<NhanVien>();
    public DbSet<KhachHang> KhachHangs => Set<KhachHang>();
    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<Size> Sizes => Set<Size>();
    public DbSet<Topping> Toppings => Set<Topping>();
    public DbSet<KhungCa> KhungCas => Set<KhungCa>();
    public DbSet<CaLamViec> CaLamViocs => Set<CaLamViec>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<HoaDon> HoaDons => Set<HoaDon>();
    public DbSet<DonHangOnline> DonHangOnlines => Set<DonHangOnline>();
    public DbSet<ChiTietHoaDon> ChiTietHoaDons => Set<ChiTietHoaDon>();
    public DbSet<ChiTietHoaDonTopping> ChiTietHoaDonToppings => Set<ChiTietHoaDonTopping>();
    public DbSet<PhieuHoanHuy> PhieuHoanHuys => Set<PhieuHoanHuy>();
    public DbSet<NhaCungCap> NhaCungCaps => Set<NhaCungCap>();
    public DbSet<NguyenLieu> NguyenLieus => Set<NguyenLieu>();
    public DbSet<PhieuNhapKho> PhieuNhapKhos => Set<PhieuNhapKho>();
    public DbSet<ChiTietPhieuNhap> ChiTietPhieuNhaps => Set<ChiTietPhieuNhap>();
    public DbSet<DanhGia> DanhGias => Set<DanhGia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureVaiTro(modelBuilder);
        ConfigureNhanVien(modelBuilder);
        ConfigureKhachHang(modelBuilder);
        ConfigureDanhMuc(modelBuilder);
        ConfigureSanPham(modelBuilder);
        ConfigureSize(modelBuilder);
        ConfigureTopping(modelBuilder);
        ConfigureKhungCa(modelBuilder);
        ConfigureCaLamViec(modelBuilder);
        ConfigureVoucher(modelBuilder);
        ConfigureHoaDon(modelBuilder);
        ConfigureDonHangOnline(modelBuilder);
        ConfigureChiTietHoaDon(modelBuilder);
        ConfigureChiTietHoaDonTopping(modelBuilder);
        ConfigurePhieuHoanHuy(modelBuilder);
        ConfigureNhaCungCap(modelBuilder);
        ConfigureNguyenLieu(modelBuilder);
        ConfigurePhieuNhapKho(modelBuilder);
        ConfigureChiTietPhieuNhap(modelBuilder);
        ConfigureDanhGia(modelBuilder);
        ConfigureMoneyDecimals(modelBuilder);
    }

    private static void ConfigureMoneyDecimals(ModelBuilder modelBuilder)
    {
        const int precision = 18;
        const int scale = 2;

        modelBuilder.Entity<SanPham>().Property(e => e.GiaBanGoc).HasPrecision(precision, scale);
        modelBuilder.Entity<Size>().Property(e => e.PhuThu).HasPrecision(precision, scale);
        modelBuilder.Entity<Topping>().Property(e => e.DonGia).HasPrecision(precision, scale);
        modelBuilder.Entity<CaLamViec>().Property(e => e.TienQuyDauCa).HasPrecision(precision, scale);
        modelBuilder.Entity<CaLamViec>().Property(e => e.TienMatThucTe).HasPrecision(precision, scale);
        modelBuilder.Entity<Voucher>().Property(e => e.GiaTriGiam).HasPrecision(precision, scale);
        modelBuilder.Entity<Voucher>().Property(e => e.DonHangToiThieu).HasPrecision(precision, scale);

        var hoaDon = modelBuilder.Entity<HoaDon>();
        hoaDon.Property(e => e.TongTienMon).HasPrecision(precision, scale);
        hoaDon.Property(e => e.PhiGiaoHang).HasPrecision(precision, scale);
        hoaDon.Property(e => e.TienGiamGia).HasPrecision(precision, scale);
        hoaDon.Property(e => e.TongThanhToan).HasPrecision(precision, scale);
        hoaDon.Property(e => e.TienKhachDua).HasPrecision(precision, scale);
        hoaDon.Property(e => e.TienThua).HasPrecision(precision, scale);

        var chiTiet = modelBuilder.Entity<ChiTietHoaDon>();
        chiTiet.Property(e => e.DonGiaGoc).HasPrecision(precision, scale);
        chiTiet.Property(e => e.PhuThuSize).HasPrecision(precision, scale);
        chiTiet.Property(e => e.ThanhTien).HasPrecision(precision, scale);

        modelBuilder.Entity<ChiTietHoaDonTopping>().Property(e => e.DonGiaTopping).HasPrecision(precision, scale);
        modelBuilder.Entity<PhieuHoanHuy>().Property(e => e.SoTienHoan).HasPrecision(precision, scale);
        modelBuilder.Entity<NguyenLieu>().Property(e => e.SoLuongTon).HasPrecision(precision, scale);
        modelBuilder.Entity<NguyenLieu>().Property(e => e.SoLuongCanhBao).HasPrecision(precision, scale);
        modelBuilder.Entity<PhieuNhapKho>().Property(e => e.TongTienNhap).HasPrecision(precision, scale);
        modelBuilder.Entity<ChiTietPhieuNhap>().Property(e => e.SoLuongNhap).HasPrecision(precision, scale);
        modelBuilder.Entity<ChiTietPhieuNhap>().Property(e => e.DonGiaNhap).HasPrecision(precision, scale);
        modelBuilder.Entity<ChiTietPhieuNhap>().Property(e => e.ThanhTien).HasPrecision(precision, scale);
    }

    private static void ConfigureVaiTro(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<VaiTro>();
        entity.ToTable("VaiTro");
        entity.HasKey(e => e.MaVaiTro);
        entity.HasIndex(e => e.TenVaiTro).IsUnique();
        entity.Property(e => e.TenVaiTro).HasMaxLength(50).IsRequired();
        entity.Property(e => e.MoTa).HasMaxLength(200);
    }

    private static void ConfigureNhanVien(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<NhanVien>();
        entity.ToTable("NhanVien");
        entity.HasKey(e => e.MaNV);
        entity.HasIndex(e => e.TenDangNhap).IsUnique();
        entity.Property(e => e.HoTen).HasMaxLength(100).IsRequired();
        entity.Property(e => e.SoDienThoai).HasMaxLength(15);
        entity.Property(e => e.GioiTinh).HasMaxLength(10);
        entity.Property(e => e.DiaChi).HasMaxLength(255);
        entity.Property(e => e.TenDangNhap).HasMaxLength(50).IsRequired();
        entity.Property(e => e.MatKhauHash).HasMaxLength(255).IsRequired();
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("HoatDong");
        entity.Property(e => e.NgayTao).HasDefaultValueSql("sysdatetime()");

        entity.HasOne(e => e.VaiTro)
            .WithMany(v => v.NhanViens)
            .HasForeignKey(e => e.MaVaiTro)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureKhachHang(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<KhachHang>();
        entity.HasKey(e => e.MaKH);
        entity.HasIndex(e => e.SoDienThoai).IsUnique();
        entity.HasIndex(e => e.Email).IsUnique();
        entity.Property(e => e.HoTen).HasMaxLength(100).IsRequired();
        entity.Property(e => e.SoDienThoai).HasMaxLength(15).IsRequired();
        entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
        entity.Property(e => e.MatKhauHash).HasMaxLength(255).IsRequired();
        entity.Property(e => e.GioiTinh).HasMaxLength(10);
        entity.Property(e => e.HangThanhVien).HasMaxLength(20).HasDefaultValue("ThanhVien");
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("HoatDong");
        entity.Property(e => e.NgayDangKy).HasDefaultValueSql("sysdatetime()");

        entity.ToTable("KhachHang", t =>
        {
            t.HasCheckConstraint("CK_KhachHang_Diem", "[DiemTichLuy] >= 0");
            t.HasCheckConstraint("CK_KhachHang_Hang",
                "[HangThanhVien] IN (N'ThanhVien', N'Bac', N'Vang', N'KimCuong')");
            t.HasCheckConstraint("CK_KhachHang_TrangThai", "[TrangThai] IN (N'HoatDong', N'Khoa')");
        });
    }

    private static void ConfigureDanhMuc(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DanhMuc>();
        entity.HasKey(e => e.MaDanhMuc);
        entity.Property(e => e.TenDanhMuc).HasMaxLength(100).IsRequired();
        entity.Property(e => e.MoTa).HasMaxLength(255);
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("HienThi");

        entity.ToTable("DanhMuc", t => t.HasCheckConstraint("CK_DanhMuc_TrangThai", "[TrangThai] = N'An' OR [TrangThai] = N'HienThi'"));
    }

    private static void ConfigureSanPham(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<SanPham>();
        entity.HasKey(e => e.MaSanPham);
        entity.HasIndex(e => e.TenSanPham);
        entity.Property(e => e.TenSanPham).HasMaxLength(150).IsRequired();
        entity.Property(e => e.MoTa).HasMaxLength(500);
        entity.Property(e => e.HinhAnh).HasMaxLength(500);
        entity.Property(e => e.GhiChuPhaChe).HasMaxLength(500);
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("DangBan");

        entity.ToTable("SanPham", t => t.HasCheckConstraint("CK_SanPham_Gia", "[GiaBanGoc] >= 0"));

        entity.HasOne(e => e.DanhMuc)
            .WithMany(d => d.SanPhams)
            .HasForeignKey(e => e.MaDanhMuc)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureSize(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Size>();
        entity.HasKey(e => e.MaSize);
        entity.HasIndex(e => e.TenSize).IsUnique();
        entity.Property(e => e.TenSize).HasMaxLength(10).IsRequired();
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("DangApDung");

        entity.ToTable("Size", t => t.HasCheckConstraint("CK_Size_PhuThu", "[PhuThu] >= 0"));
    }

    private static void ConfigureTopping(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Topping>();
        entity.HasKey(e => e.MaTopping);
        entity.Property(e => e.TenTopping).HasMaxLength(100).IsRequired();
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("DangBan");

        entity.ToTable("Topping", t => t.HasCheckConstraint("CK_Topping_DonGia", "[DonGia] >= 0"));
    }

    private static void ConfigureKhungCa(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<KhungCa>();
        entity.ToTable("KhungCa");
        entity.HasKey(e => e.MaKhungCa);
        entity.Property(e => e.TenCa).HasMaxLength(50).IsRequired();
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("HoatDong");
    }

    private static void ConfigureCaLamViec(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CaLamViec>();
        entity.HasKey(e => e.MaCa);
        entity.Property(e => e.TrangThaiCa).HasMaxLength(20).HasDefaultValue("DangMo");
        entity.Property(e => e.GhiChu).HasMaxLength(255);
        entity.Property(e => e.TienQuyDauCa).HasDefaultValue(0m);

        entity.ToTable("CaLamViec", t =>
        {
            t.HasCheckConstraint("CK_CaLamViec_TienQuy", "[TienQuyDauCa] >= 0");
            t.HasCheckConstraint("CK_CaLamViec_TienMatThucTe", "[TienMatThucTe] IS NULL OR [TienMatThucTe] >= 0");
            t.HasCheckConstraint("CK_CaLamViec_TrangThai", "[TrangThaiCa] = N'DaDong' OR [TrangThaiCa] = N'DangMo'");
        });

        entity.HasOne(e => e.KhungCa)
            .WithMany(k => k.CaLamViocs)
            .HasForeignKey(e => e.MaKhungCa)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.NhanVien)
            .WithMany(n => n.CaLamViocs)
            .HasForeignKey(e => e.MaNV)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureVoucher(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Voucher>();
        entity.HasKey(e => e.MaVoucher);
        entity.HasIndex(e => e.MaCode).IsUnique();
        entity.Property(e => e.MaCode).HasMaxLength(30).IsRequired();
        entity.Property(e => e.MoTa).HasMaxLength(255);
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("ConHieuLuc");

        entity.ToTable("Voucher", t => t.HasCheckConstraint("CK_Voucher_GiaTri", "[GiaTriGiam] >= 0"));
    }

    private static void ConfigureHoaDon(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<HoaDon>();
        entity.HasKey(e => e.MaHoaDon);
        entity.HasIndex(e => e.LoaiDon);
        entity.HasIndex(e => e.TrangThaiHoaDon);
        entity.HasIndex(e => e.ThoiGianLap);
        entity.Property(e => e.LoaiDon).HasMaxLength(20).IsRequired();
        entity.Property(e => e.TrangThaiHoaDon).HasMaxLength(30).HasDefaultValue("ChoThanhToan");
        entity.Property(e => e.PhuongThucThanhToan).HasMaxLength(30);
        entity.Property(e => e.GhiChu).HasMaxLength(500);

        entity.ToTable("HoaDon", t =>
        {
            t.HasCheckConstraint("CK_HoaDon_LoaiDon", "[LoaiDon] = N'Online' OR [LoaiDon] = N'TaiQuay'");
            t.HasCheckConstraint("CK_HoaDon_TrangThai",
                "[TrangThaiHoaDon] = N'DaHuy' OR [TrangThaiHoaDon] = N'HoanThanh' OR [TrangThaiHoaDon] = N'ChoPhaChe' OR [TrangThaiHoaDon] = N'DaThanhToan' OR [TrangThaiHoaDon] = N'ChoThanhToan'");
            t.HasCheckConstraint("CK_HoaDon_Tien",
                "[TongTienMon] >= 0 AND [PhiGiaoHang] >= 0 AND [TienGiamGia] >= 0 AND [DiemSuDung] >= 0 AND [TongThanhToan] >= 0");
        });

        entity.HasOne(e => e.KhachHang)
            .WithMany(k => k.HoaDons)
            .HasForeignKey(e => e.MaKH)
            .OnDelete(DeleteBehavior.SetNull);

        entity.HasOne(e => e.NhanVienLap)
            .WithMany(n => n.HoaDonsLap)
            .HasForeignKey(e => e.MaNVLap)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.CaLamViec)
            .WithMany(c => c.HoaDons)
            .HasForeignKey(e => e.MaCa)
            .OnDelete(DeleteBehavior.SetNull);

        entity.HasOne(e => e.Voucher)
            .WithMany(v => v.HoaDons)
            .HasForeignKey(e => e.MaVoucher)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureDonHangOnline(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DonHangOnline>();
        entity.HasKey(e => e.MaHoaDon);
        entity.HasIndex(e => e.TrangThaiOnline);
        entity.Property(e => e.HoTenNhanHang).HasMaxLength(100).IsRequired();
        entity.Property(e => e.SoDienThoaiNhan).HasMaxLength(15).IsRequired();
        entity.Property(e => e.DiaChiGiao).HasMaxLength(255).IsRequired();
        entity.Property(e => e.GhiChuGiaoHang).HasMaxLength(255);
        entity.Property(e => e.TrangThaiOnline).HasMaxLength(30).HasDefaultValue("ChoXacNhan");
        entity.Property(e => e.LyDoHuy).HasMaxLength(255);

        entity.ToTable("DonHangOnline", t => t.HasCheckConstraint("CK_DonHangOnline_TrangThai",
            "[TrangThaiOnline] = N'DaHuy' OR [TrangThaiOnline] = N'HoanThanh' OR [TrangThaiOnline] = N'DangGiao' OR [TrangThaiOnline] = N'DangXuLy' OR [TrangThaiOnline] = N'ChoXacNhan'"));

        entity.HasOne(e => e.HoaDon)
            .WithOne(h => h.DonHangOnline)
            .HasForeignKey<DonHangOnline>(e => e.MaHoaDon)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.NhanVienXacNhan)
            .WithMany(n => n.DonHangOnlineXacNhan)
            .HasForeignKey(e => e.MaNVXacNhan)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureChiTietHoaDon(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ChiTietHoaDon>();
        entity.HasKey(e => e.MaChiTiet);
        entity.Property(e => e.GhiChu).HasMaxLength(255);

        entity.ToTable("ChiTietHoaDon", t =>
        {
            t.HasCheckConstraint("CK_CTHD_SoLuong", "[SoLuong] > 0");
            t.HasCheckConstraint("CK_CTHD_Tien", "[DonGiaGoc] >= 0 AND [PhuThuSize] >= 0 AND [ThanhTien] >= 0");
        });

        entity.HasOne(e => e.HoaDon)
            .WithMany(h => h.ChiTietHoaDons)
            .HasForeignKey(e => e.MaHoaDon)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.SanPham)
            .WithMany(s => s.ChiTietHoaDons)
            .HasForeignKey(e => e.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.Size)
            .WithMany(s => s.ChiTietHoaDons)
            .HasForeignKey(e => e.MaSize)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureChiTietHoaDonTopping(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ChiTietHoaDonTopping>();
        entity.HasKey(e => new { e.MaChiTiet, e.MaTopping });
        entity.Property(e => e.SoLuong).HasDefaultValue(1);

        entity.ToTable("ChiTietHoaDon_Topping", t =>
        {
            t.HasCheckConstraint("CK_CTT_DonGia", "[DonGiaTopping] >= 0");
            t.HasCheckConstraint("CK_CTT_SoLuong", "[SoLuong] > 0");
        });

        entity.HasOne(e => e.ChiTietHoaDon)
            .WithMany(c => c.ChiTietHoaDonToppings)
            .HasForeignKey(e => e.MaChiTiet)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.Topping)
            .WithMany(t => t.ChiTietHoaDonToppings)
            .HasForeignKey(e => e.MaTopping)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigurePhieuHoanHuy(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PhieuHoanHuy>();
        entity.ToTable("PhieuHoanHuy");
        entity.HasKey(e => e.MaPhieu);
        entity.Property(e => e.HinhThucXuLy).HasMaxLength(50).IsRequired();
        entity.Property(e => e.LyDo).HasMaxLength(500).IsRequired();
        entity.Property(e => e.HinhThucHoan).HasMaxLength(30);
        entity.Property(e => e.TrangThaiXuLy).HasMaxLength(30).HasDefaultValue("DaGhiNhan");

        entity.HasOne(e => e.HoaDon)
            .WithMany(h => h.PhieuHoanHuys)
            .HasForeignKey(e => e.MaHoaDon)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.NhanVienXuLy)
            .WithMany(n => n.PhieuHoanHuys)
            .HasForeignKey(e => e.MaNVXuLy)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureNhaCungCap(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<NhaCungCap>();
        entity.ToTable("NhaCungCap");
        entity.HasKey(e => e.MaNCC);
        entity.Property(e => e.TenNCC).HasMaxLength(150).IsRequired();
        entity.Property(e => e.SoDienThoai).HasMaxLength(15);
        entity.Property(e => e.DiaChi).HasMaxLength(255);
        entity.Property(e => e.Email).HasMaxLength(100);
        entity.Property(e => e.NguoiLienHe).HasMaxLength(100);
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("DangHopTac");
    }

    private static void ConfigureNguyenLieu(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<NguyenLieu>();
        entity.HasKey(e => e.MaNL);
        entity.Property(e => e.TenNL).HasMaxLength(150).IsRequired();
        entity.Property(e => e.DonViTinh).HasMaxLength(20).IsRequired();
        entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("ConHang");

        entity.ToTable("NguyenLieu", t =>
        {
            t.HasCheckConstraint("CK_NL_SoLuong", "[SoLuongTon] >= 0 AND [SoLuongCanhBao] >= 0");
        });
    }

    private static void ConfigurePhieuNhapKho(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PhieuNhapKho>();
        entity.HasKey(e => e.MaPhieuNhap);
        entity.HasIndex(e => e.NgayNhap);
        entity.Property(e => e.TrangThaiPhieu).HasMaxLength(20).HasDefaultValue("ChoDuyet");
        entity.Property(e => e.GhiChu).HasMaxLength(255);

        entity.ToTable("PhieuNhapKho", t => t.HasCheckConstraint("CK_PNK_TongTien", "[TongTienNhap] >= 0"));

        entity.HasOne(e => e.NhaCungCap)
            .WithMany(n => n.PhieuNhapKhos)
            .HasForeignKey(e => e.MaNCC)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.NhanVienLap)
            .WithMany(n => n.PhieuNhapKhosLap)
            .HasForeignKey(e => e.MaNVLap)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.NhanVienDuyet)
            .WithMany(n => n.PhieuNhapKhosDuyet)
            .HasForeignKey(e => e.MaNVDuyet)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureChiTietPhieuNhap(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ChiTietPhieuNhap>();
        entity.HasKey(e => e.MaChiTietNhap);

        entity.ToTable("ChiTietPhieuNhap", t =>
        {
            t.HasCheckConstraint("CK_CTPN_SoLuong", "[SoLuongNhap] > 0");
            t.HasCheckConstraint("CK_CTPN_Tien", "[DonGiaNhap] >= 0 AND [ThanhTien] >= 0");
        });

        entity.HasOne(e => e.PhieuNhapKho)
            .WithMany(p => p.ChiTietPhieuNhaps)
            .HasForeignKey(e => e.MaPhieuNhap)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(e => e.NguyenLieu)
            .WithMany(n => n.ChiTietPhieuNhaps)
            .HasForeignKey(e => e.MaNL)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureDanhGia(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DanhGia>();
        entity.HasKey(e => e.MaDanhGia);
        entity.Property(e => e.NoiDung).HasMaxLength(500);

        entity.ToTable("DanhGia", t => t.HasCheckConstraint("CK_DG_SoSao", "[SoSao] >= 1 AND [SoSao] <= 5"));

        entity.HasOne(e => e.HoaDon)
            .WithMany(h => h.DanhGias)
            .HasForeignKey(e => e.MaHoaDon)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.SanPham)
            .WithMany(s => s.DanhGias)
            .HasForeignKey(e => e.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.KhachHang)
            .WithMany(k => k.DanhGias)
            .HasForeignKey(e => e.MaKH)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
