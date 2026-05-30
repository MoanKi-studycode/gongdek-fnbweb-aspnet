import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Search, MessageSquare } from 'lucide-react';
import { getAllReviews } from '@/services/reviewService';
import { StarRating } from '@/components/reviews/StarRating';
import type { ProductReview } from '@/types/modules';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getAllReviews()
      .then(setReviews)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải đánh giá.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q),
    );
  }, [reviews, search]);

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đánh giá sản phẩm</h1>
            <p className="text-gray-600 mt-1">Phản hồi từ khách hàng sau khi hoàn thành đơn hàng</p>
          </div>
          <div className="flex gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[#8B7355]" />
                <div>
                  <p className="text-sm text-gray-600">Tổng đánh giá</p>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm sản phẩm, khách hàng, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Không có đánh giá phù hợp.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Sao</TableHead>
                    <TableHead>Bình luận</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.productName}</TableCell>
                      <TableCell>{review.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{review.invoiceId.padStart(4, '0')}</Badge>
                      </TableCell>
                      <TableCell>
                        <StarRating value={review.stars} size="sm" />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">
                        {review.comment || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
