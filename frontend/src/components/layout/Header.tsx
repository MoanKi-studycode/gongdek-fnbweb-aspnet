import { Link } from 'react-router';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth, getAccountHref } from '@/contexts/AuthContext';
import { CartSheet } from '@/components/cart/CartSheet';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const accountHref = getAccountHref(user);
  const accountLabel = user ? `Tài khoản: ${user.hoTen}` : 'Đăng nhập';
  const { getCartCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-16 py-2">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <BrandLogo size="md" className="md:w-16 md:h-16" />
              <span className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                GONGDEK TEA & COFFEE
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-600 hover:text-[#8B7355] transition-colors"
              >
                Trang chủ
              </button>
              <button
                onClick={() => scrollToSection('menu')}
                className="text-gray-600 hover:text-[#8B7355] transition-colors"
              >
                Thực đơn
              </button>
              <button
                onClick={() => scrollToSection('story')}
                className="text-gray-600 hover:text-[#8B7355] transition-colors"
              >
                Về chúng tôi
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to={accountHref}
                className="hidden md:flex items-center gap-1.5"
                title={accountLabel}
              >
                <User className="w-6 h-6 text-gray-600 hover:text-[#8B7355] transition-colors shrink-0" />
                {user?.vaiTro === 'KhachHang' && (
                  <span className="text-sm text-gray-700 max-w-[120px] truncate">{user.hoTen}</span>
                )}
              </Link>

              <Link
                to={accountHref}
                className="md:hidden"
                title={accountLabel}
              >
                <User className="w-6 h-6 text-gray-600 hover:text-[#8B7355] transition-colors" />
              </Link>

              <button
                type="button"
                className="relative"
                title="Giỏ hàng"
                onClick={openCart}
              >
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-[#8B7355] transition-colors" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>

              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 text-left"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => scrollToSection('menu')}
                  className="text-gray-600 text-left"
                >
                  Thực đơn
                </button>
                <button
                  onClick={() => scrollToSection('story')}
                  className="text-gray-600 text-left"
                >
                  Về chúng tôi
                </button>
                <Link
                  to={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600"
                >
                  {user ? `Tài khoản (${user.hoTen})` : 'Đăng nhập'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    openCart();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 text-left"
                >
                  Giỏ hàng
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      <CartSheet />
    </>
  );
}
