import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandLogo } from '@/components/common/BrandLogo';
import { getDefaultRouteForRole, useAuth } from '@/contexts/AuthContext';
import { authPathWithReturn, safeReturnUrl } from '@/lib/authRedirect';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = safeReturnUrl(searchParams.get('returnUrl'));
  const { register } = useAuth();

  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginHref = authPathWithReturn('/auth/login', returnUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (matKhau !== xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        hoTen: hoTen.trim(),
        email: email.trim(),
        soDienThoai: soDienThoai.trim(),
        matKhau,
      });
      navigate(returnUrl ?? getDefaultRouteForRole(user.vaiTro));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C9B89A] to-[#A89074] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo size="lg" className="mx-auto mb-4 w-20 h-20" />
          <CardTitle className="text-3xl">GongDek</CardTitle>
          <CardDescription>Tạo tài khoản khách hàng</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hoTen">Họ tên *</Label>
              <Input
                id="hoTen"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soDienThoai">Số điện thoại *</Label>
              <Input
                id="soDienThoai"
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="0901234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matKhau">Mật khẩu *</Label>
              <Input
                id="matKhau"
                type="password"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu *</Label>
              <Input
                id="xacNhanMatKhau"
                type="password"
                value={xacNhanMatKhau}
                onChange={(e) => setXacNhanMatKhau(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#6F5B44]" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản?{' '}
            <Link to={loginHref} className="text-[#8B7355] font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
