import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandLogo } from '@/components/common/BrandLogo';
import { getAccountHref, useAuth } from '@/contexts/AuthContext';
import { authPathWithReturn, safeReturnUrl } from '@/lib/authRedirect';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = safeReturnUrl(searchParams.get('returnUrl'));
  const { login, user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    navigate(returnUrl ?? getAccountHref(user), { replace: true });
  }, [isLoading, isAuthenticated, user, returnUrl, navigate]);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const registerHref = authPathWithReturn('/auth/register', returnUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = identifier.includes('@')
        ? { email: identifier.trim(), matKhau: password }
        : { tenDangNhap: identifier.trim(), matKhau: password };

      const loggedInUser = await login(payload);
      navigate(returnUrl ?? getAccountHref(loggedInUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C9B89A] to-[#A89074] flex items-center justify-center p-4">
        <p className="text-white">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C9B89A] to-[#A89074] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo size="lg" className="mx-auto mb-4 w-20 h-20" />
          <CardTitle className="text-3xl">GongDek</CardTitle>
          <CardDescription>Đăng nhập hệ thống</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Tên đăng nhập hoặc Email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email khách hàng hoặc tên đăng nhập NV..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#6F5B44]" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Chưa có tài khoản khách hàng?{' '}
            <Link to={registerHref} className="text-[#8B7355] font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
