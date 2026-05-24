import { Outlet } from 'react-router';
import { Header } from '@/components/layout/Header';
import { CartProvider } from '@/contexts/CartContext';

export function PublicLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Outlet />
      </div>
    </CartProvider>
  );
}
