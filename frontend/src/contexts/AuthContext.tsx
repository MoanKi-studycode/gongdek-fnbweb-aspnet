import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  registerCustomer as apiRegisterCustomer,
  getCurrentUser,
  getStoredUser,
  saveUser,
  type AuthUser,
  type LoginRequest,
  type UserRole,
} from '@/services/authService';

export interface RegisterCustomerRequest {
  hoTen: string;
  email: string;
  soDienThoai: string;
  matKhau: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  register: (data: RegisterCustomerRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gongdek_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((profile) => {
        setUser(profile);
        saveUser(profile);
      })
      .catch(async () => {
        await apiLogout();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await apiLogin(credentials);
    setUser(response.user);
    saveUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterCustomerRequest) => {
    const response = await apiRegisterCustomer(data);
    setUser(response.user);
    saveUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => (user ? roles.includes(user.vaiTro) : false), [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'QuanLy':
      return '/admin/dashboard';
    case 'NhanVien':
      return '/employee/pos';
    case 'KhachHang':
      return '/customer/home';
    default:
      return '/';
  }
}

/** Đích điều hướng khi nhấn icon tài khoản trên trang công khai. */
export function getAccountHref(user: AuthUser | null): string {
  if (!user) return '/auth/login';
  return getDefaultRouteForRole(user.vaiTro);
}
