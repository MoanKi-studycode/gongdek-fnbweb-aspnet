import { Navigate, useLocation } from 'react-router';
import type { UserRole } from '@/services/authService';
import { useAuth, getDefaultRouteForRole } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  loginPath?: string;
}

/** Bảo vệ route theo vai trò — redirect nếu chưa đăng nhập hoặc sai quyền */
export function RoleGuard({ allowedRoles, children, loginPath = '/auth/login' }: RoleGuardProps) {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.vaiTro)) {
    return <Navigate to={getDefaultRouteForRole(user.vaiTro)} replace />;
  }

  return <>{children}</>;
}

