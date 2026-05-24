import type { Product, Topping } from '@/types';
import type { Invoice, OnlineOrder, OrderStatus } from '@/types/modules';
import { resolveProductImageUrl } from '@/lib/productImage';

export interface SanPhamApi {
  maSanPham: number;
  tenSanPham: string;
  maDanhMuc: number;
  tenDanhMuc: string;
  moTa?: string | null;
  giaBanGoc: number;
  hinhAnh?: string | null;
  trangThai: string;
}

export interface DanhMucApi {
  maDanhMuc: number;
  tenDanhMuc: string;
  moTa?: string | null;
  trangThai: string;
}

export interface SizeApi {
  maSize: number;
  tenSize: string;
  phuThu: number;
  trangThai: string;
}

export interface ToppingApi {
  maTopping: number;
  tenTopping: string;
  donGia: number;
  trangThai: string;
}

export interface HoaDonListApi {
  maHoaDon: number;
  loaiDon: string;
  trangThaiHoaDon: string;
  tenKhachHang?: string | null;
  soDienThoaiKhach?: string | null;
  tenNhanVienLap: string;
  thoiGianLap: string;
  tongThanhToan: number;
  phuongThucThanhToan?: string | null;
}

export interface HoaDonDetailApi extends HoaDonListApi {
  tongTienMon: number;
  tienGiamGia: number;
  phiGiaoHang: number;
  ghiChu?: string | null;
  chiTiet: {
    maChiTiet: number;
    maSanPham: number;
    tenSanPham: string;
    maSize: number;
    tenSize: string;
    soLuong: number;
    donGiaGoc: number;
    phuThuSize: number;
    thanhTien: number;
    ghiChu?: string | null;
    toppings: { maTopping: number; tenTopping: string; donGiaTopping: number; soLuong: number }[];
  }[];
}

export interface DonHangOnlineListApi {
  maHoaDon: number;
  hoTenNhanHang: string;
  soDienThoaiNhan: string;
  diaChiGiao: string;
  trangThaiOnline: string;
  tongThanhToan: number;
  thoiGianLap: string;
  thoiGianXacNhan?: string | null;
  thoiGianHoanThanh?: string | null;
}

export interface DonHangOnlineDetailApi extends DonHangOnlineListApi {
  ghiChuGiaoHang?: string | null;
  lyDoHuy?: string | null;
  hoaDon: HoaDonDetailApi;
}

export function mapSanPhamToProduct(dto: SanPhamApi): Product {
  return {
    id: String(dto.maSanPham),
    name: dto.tenSanPham,
    description: dto.moTa ?? '',
    price: dto.giaBanGoc,
    image: resolveProductImageUrl(dto.hinhAnh, dto.maSanPham),
    category: dto.tenDanhMuc,
  };
}

export function mapToppingApi(dto: ToppingApi): Topping {
  return {
    id: String(dto.maTopping),
    name: dto.tenTopping,
    price: dto.donGia,
  };
}

export function mapPaymentMethod(value?: string | null): Invoice['paymentMethod'] {
  switch (value) {
    case 'TienMat':
      return 'Tiền mặt';
    case 'ChuyenKhoan':
      return 'Chuyển khoản';
    case 'ViDienTu':
      return 'Ví điện tử';
    default:
      return 'Tiền mặt';
  }
}

export function mapOnlineStatus(status: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    ChoXacNhan: 'CHO_XAC_NHAN',
    DangXuLy: 'DANG_XU_LY',
    DangGiao: 'DANG_GIAO',
    HoanThanh: 'HOAN_THANH',
    DaHuy: 'DA_HUY',
  };
  return map[status] ?? 'CHO_XAC_NHAN';
}

export function mapHoaDonDetailToInvoice(dto: HoaDonDetailApi): Invoice {
  return {
    id: String(dto.maHoaDon),
    invoiceCode: String(dto.maHoaDon).padStart(4, '0'),
    customerName: dto.tenKhachHang ?? 'Khách lẻ',
    customerPhone: dto.soDienThoaiKhach ?? '',
    employeeName: dto.tenNhanVienLap,
    items: dto.chiTiet.map((ct) => ({
      productName: ct.tenSanPham,
      size: ct.tenSize,
      toppings: ct.toppings.map((t) => t.tenTopping),
      notes: ct.ghiChu ?? '',
      quantity: ct.soLuong,
      price: ct.thanhTien,
    })),
    subtotal: dto.tongTienMon,
    discount: dto.tienGiamGia,
    total: dto.tongThanhToan,
    paymentMethod: mapPaymentMethod(dto.phuongThucThanhToan),
    createdAt: dto.thoiGianLap,
  };
}

export function mapHoaDonListToInvoice(dto: HoaDonListApi): Invoice {
  return {
    id: String(dto.maHoaDon),
    invoiceCode: String(dto.maHoaDon).padStart(4, '0'),
    customerName: dto.tenKhachHang ?? 'Khách lẻ',
    customerPhone: dto.soDienThoaiKhach ?? '',
    employeeName: dto.tenNhanVienLap,
    items: [],
    subtotal: dto.tongThanhToan,
    discount: 0,
    total: dto.tongThanhToan,
    paymentMethod: mapPaymentMethod(dto.phuongThucThanhToan),
    createdAt: dto.thoiGianLap,
  };
}

export function mapDonHangOnlineList(dto: DonHangOnlineListApi): OnlineOrder {
  return {
    id: String(dto.maHoaDon),
    orderCode: String(dto.maHoaDon).padStart(4, '0'),
    customerName: dto.hoTenNhanHang,
    customerPhone: dto.soDienThoaiNhan,
    deliveryAddress: dto.diaChiGiao,
    items: [],
    subtotal: dto.tongThanhToan,
    discount: 0,
    deliveryFee: 0,
    total: dto.tongThanhToan,
    paymentMethod: 'Chuyển khoản',
    status: mapOnlineStatus(dto.trangThaiOnline),
    notes: '',
    createdAt: dto.thoiGianLap,
    updatedAt: dto.thoiGianHoanThanh ?? dto.thoiGianXacNhan ?? dto.thoiGianLap,
  };
}

export function mapDonHangOnlineDetail(dto: DonHangOnlineDetailApi): OnlineOrder {
  const invoice = mapHoaDonDetailToInvoice(dto.hoaDon);
  return {
    id: String(dto.maHoaDon),
    orderCode: String(dto.maHoaDon).padStart(4, '0'),
    customerName: dto.hoTenNhanHang,
    customerPhone: dto.soDienThoaiNhan,
    deliveryAddress: dto.diaChiGiao,
    items: invoice.items,
    subtotal: dto.hoaDon.tongTienMon,
    discount: dto.hoaDon.tienGiamGia,
    deliveryFee: dto.hoaDon.phiGiaoHang,
    total: dto.tongThanhToan,
    paymentMethod: mapPaymentMethod(dto.hoaDon.phuongThucThanhToan),
    status: mapOnlineStatus(dto.trangThaiOnline),
    notes: dto.ghiChuGiaoHang ?? '',
    createdAt: dto.thoiGianLap,
    updatedAt: dto.thoiGianHoanThanh ?? dto.thoiGianXacNhan ?? dto.thoiGianLap,
  };
}
