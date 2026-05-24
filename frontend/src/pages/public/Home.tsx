import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Camera, MapPin, Clock, Instagram } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts } from '@/services/productService';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('cart') !== 'open') return;
    openCart();
    const next = new URLSearchParams(searchParams);
    next.delete('cart');
    setSearchParams(next, { replace: true });
    // Chỉ mở giỏ một lần khi quay về từ đăng nhập (?cart=open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng kiểm tra API.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tất cả', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'Tất cả'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background/hero.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl mb-6">
            Chào mừng đến với GongDek Tea & Coffee
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Nơi hội tụ hương vị trà sữa, cà phê và không gian chill
          </p>
          <Button
            size="lg"
            className="bg-white text-[#8B7355] hover:bg-[#F5F5DC] text-lg px-8"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Xem thực đơn
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#FAF8F3]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-gray-900">
            Tại sao chọn GongDek?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DCC4] rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-[#8B7355]" />
              </div>
              <h3 className="text-xl mb-4 text-gray-900">Nguyên liệu cao cấp</h3>
              <p className="text-gray-600">
                Chúng tôi chỉ sử dụng trà tươi ngon nhất, sữa tươi nguyên chất và topping tự làm cho ly đồ uống hoàn hảo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DCC4] rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-[#8B7355]" />
              </div>
              <h3 className="text-xl mb-4 text-gray-900">Không gian Check-in</h3>
              <p className="text-gray-600">
                Quán có nhiều góc chụp ảnh đẹp với gương, ánh sáng và decor thẩm mỹ, lý tưởng cho bạn lưu giữ khoảnh khắc.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DCC4] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#8B7355]" />
              </div>
              <h3 className="text-xl mb-4 text-gray-900">Pha chế tận tâm</h3>
              <p className="text-gray-600">
                Mỗi ly đồ uống được pha chế cẩn thận, tỉ mỉ để mang đến trải nghiệm tuyệt vời nhất cho bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Thực đơn đồ uống
            </h2>
            <p className="text-xl text-gray-600">
              Khám phá bộ sưu tập đồ uống pha chế tươi ngon của chúng tôi
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-[#FAF8F3] text-gray-700 hover:bg-[#E8DCC4]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-16"><LoadingSpinner /></div>
            ) : error ? (
              <div className="col-span-full text-center py-16">
                <p className="text-red-600">Không thể tải dữ liệu. Vui lòng kiểm tra API.</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">Chưa có dữ liệu.</div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Photoshoot Corner Gallery */}
      <section className="py-20 px-4 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Góc Check-in & Không gian
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Không gian đẹp, sống ảo cực chất dành cho bạn
            </p>
            <div className="flex items-center justify-center gap-2 text-[#8B7355]">
              <Instagram className="w-5 h-5" />
              <span className="font-medium">Tag @gongdek để được đăng lại</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative overflow-hidden rounded-lg shadow-xl group">
              <img
                src="/images/background/checkin3.png"
                alt="Gương hồng check-in GongDek"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl mb-2">Tường gương toàn thân</h3>
                <p className="text-white/90">Hoàn hảo cho ảnh full body và ảnh nhóm</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-xl group">
              <img
                src="/images/background/checkin2.png"
                alt="Góc đèn neon GongDek"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl mb-2">Góc đèn neon nghệ thuật</h3>
                <p className="text-white/90">Ánh sáng lung linh cho ảnh ảo diệu</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-xl group">
              <img
                src="/images/background/checkin1.png"
                alt="Không gian kiến trúc GongDek"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl mb-2">Góc gương sáng tạo</h3>
                <p className="text-white/90">Góc độ độc đáo và phản chiếu sáng tạo</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-xl group">
              <img
                src="/images/background/checkin4.png"
                alt="Khu vực ngồi GongDek"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl mb-2">Khu vực ngồi ấm cúng</h3>
                <p className="text-white/90">Không gian thân mật với ánh sáng tự nhiên</p>
              </div>
            </div>
          </div>

          {/* Mirror Features */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl mb-6 text-center text-gray-900">
              Đặc điểm không gian
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#E8DCC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-[#8B7355]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Gương bố trí khoa học</h4>
                  <p className="text-gray-600">
                    Gương từ sàn tới trần được bố trí để tạo góc chụp đẹp nhất và tạo chiều sâu ấn tượng
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#E8DCC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#8B7355]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Ánh sáng hoàn hảo</h4>
                  <p className="text-gray-600">
                    Ánh sáng tự nhiên kết hợp đèn LED ấm áp cho những bức ảnh đẹp mọi lúc
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#E8DCC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-6 h-6 text-[#8B7355]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Decor thẩm mỹ</h4>
                  <p className="text-gray-600">
                    Trang trí được chọn lọc kỹ lưỡng, cây xanh và họa tiết làm mọi góc đều sẵn sàng chụp ảnh
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#E8DCC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#8B7355]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Chiều cao selfie lý tưởng</h4>
                  <p className="text-gray-600">
                    Gương được đặt ở nhiều độ cao khác nhau cho góc selfie hoàn hảo mọi lúc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Câu chuyện thương hiệu
            </h2>
            <p className="text-xl text-gray-600">
              Nơi đồ uống ngon gặp gỡ trải nghiệm đẹp
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-[#FAF8F3] p-8 rounded-lg shadow-md">
              <h3 className="text-2xl mb-6 text-gray-900">Ghé thăm chúng tôi</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-[#8B7355] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600">
                      35 Biệt Thự, Nha Trang, Khánh Hòa
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-[#8B7355] mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Giờ mở cửa</p>
                    <p className="text-gray-600">
                      Hàng ngày: 08:00 – 22:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#E8DCC4] p-8 rounded-lg shadow-md">
              <h3 className="text-2xl mb-6 text-gray-900">Liên hệ</h3>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Điện thoại:</span> 0354717914
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> gongdek_nhom20@gmail.com
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Instagram:</span> @gongdek
                </p>
              </div>
            </div>
          </div>

          {/* Ambiance Description */}
          <div className="bg-gradient-to-r from-[#C9B89A] to-[#A89074] text-white p-8 md:p-12 rounded-lg shadow-lg text-center">
            <h3 className="text-3xl mb-6">Không gian ấm cúng</h3>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              Bước vào GongDek, bạn sẽ trải nghiệm không chỉ đồ uống ngon mà còn là không gian tuyệt vời.
              Thiết kế nội thất được chăm chút kỹ lưỡng, kết hợp giữa sự hiện đại và ấm cúng. Nhạc lounge
              nhẹ nhàng, hương thơm của trà tươi và không khí vui vẻ khiến quán trở thành địa điểm hoàn hảo
              để thư giãn, gặp gỡ bạn bè, học tập và tạo nên những kỷ niệm đẹp. Dù bạn đến gặp bạn bè,
              làm việc từ xa hay chỉ đơn giản tận hưởng khoảnh khắc yên tĩnh, GongDek luôn sẵn sàng đón bạn.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#FAF8F3]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl mb-6 text-gray-900">
            Sẵn sàng trải nghiệm GongDek?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Đặt hàng ngay và ghé quán nhận đồ uống, cùng tận hưởng không gian check-in tuyệt đẹp!
          </p>
          <Button
            size="lg"
            className="bg-[#8B7355] hover:bg-[#6F5B44] text-white text-lg px-8"
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Đặt hàng ngay
          </Button>
        </div>
      </section>
    </div>
  );
}