import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StarRating } from '@/components/reviews/StarRating';
import { ProductReviewBadge } from '@/components/reviews/ProductReviewBadge';
import {
  formatReviewRating,
  getReviewSummaryByProduct,
  getReviewsByProduct,
} from '@/services/reviewService';
import type { ProductReview, ProductReviewSummary } from '@/types/modules';

interface ProductReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  initialSummary?: ProductReviewSummary | null;
}

export function ProductReviewsDialog({
  open,
  onOpenChange,
  productId,
  productName,
  initialSummary,
}: ProductReviewsDialogProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ProductReviewSummary | null>(initialSummary ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, sum] = await Promise.all([
        getReviewsByProduct(productId),
        getReviewSummaryByProduct(productId),
      ]);
      setReviews(list);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đánh giá.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đánh giá — {productName}</DialogTitle>
          <DialogDescription>
            {summary ? (
              <span className="inline-flex items-center gap-2 pt-1">
                <StarRating value={summary.averageRating} />
                <span>
                  {formatReviewRating(summary.averageRating)} / 5 · {summary.count} lượt
                </span>
              </span>
            ) : (
              'Khách hàng đã mua và trải nghiệm sản phẩm'
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm py-4">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">Chưa có đánh giá nào cho món này.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-900">{review.userName}</p>
                  <StarRating value={review.stars} size="sm" />
                </div>
                {review.comment && <p className="text-sm text-gray-700 mb-2">{review.comment}</p>}
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
