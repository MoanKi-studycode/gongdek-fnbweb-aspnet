import { apiClient, setAuthToken } from './apiClient';

export type UserRole = 'QuanLy' | 'NhanVien' | 'KhachHang';

export interface LoginRequest {
  tenDangNhap?: string;
  email?: string;
  matKhau: string;
}

export interface AuthUser {
  id: number;
  hoTen: string;
  vaiTro: UserRole;
  tenDangNhap?: string;
  email?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const USER_STORAGE_KEY = 'gongdek_user';

export function saveUser(user: AuthUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  if (response.token) setAuthToken(response.token);
  return response;
}

export async function registerCustomer(data: {
  hoTen: string;
  email: string;
  soDienThoai: string;
  matKhau: string;
}): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/register-customer', data);
  if (response.token) setAuthToken(response.token);
  return response;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const profile = await apiClient.get<AuthUser>('/auth/me');
  return {
    id: profile.id,
    hoTen: profile.hoTen,
    vaiTro: profile.vaiTro as UserRole,
    tenDangNhap: profile.tenDangNhap,
    email: profile.email,
  };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // ignore
  }
  setAuthToken(null);
  localStorage.removeItem(USER_STORAGE_KEY);
}
