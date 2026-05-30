import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InteractiveStarRating, StarRating } from '@/components/reviews/StarRating';
import { getMyInvoiceById } from '@/services/customerService';
import { createReview, getReviewsByInvoice } from '@/services/reviewService';
import { isOrderCompleted } from '@/services/orderStatus';
import { notifyError, notifySuccess, notifyWarning } from '@/components/common/ToastMessage';
import type { Invoice } from '@/types/modules';

interface OrderReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  onReviewed?: () => void;
}

type ReviewableItem = {
  productId: string;
  productName: string;
  size: string;
};

export function OrderReviewDialog({ open, onOpenChange, invoiceId, onReviewed }: OrderReviewDialogProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [detail, existing] = await Promise.all([
        getMyInvoiceById(invoiceId),
        getReviewsByInvoice(invoiceId),
      ]);
      setInvoice(detail);
      setReviewedProductIds(new Set(existing.map((r) => r.productId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (open) {
      setActiveProductId(null);
      setStars(5);
      setComment('');
      void load();
    }
  }, [open, load]);

  const reviewableItems = useMemo((): ReviewableItem[] => {
    if (!invoice) return [];
    const map = new Map<string, ReviewableItem>();
    for (const item of invoice.items) {
      if (!item.productId) continue;
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          size: item.size,
        });
      }
    }
    return Array.from(map.values());
  }, [invoice]);

  const canReviewOrder = invoice ? isOrderCompleted(invoice) : false;

  const handleSubmit = async () => {
    if (!activeProductId || !invoice) return;
    if (stars < 1) {
      notifyWarning('Vui lòng chọn số sao.');
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        maHoaDon: Number(invoice.id),
        maSanPham: Number(activeProductId),
        soSao: stars,
        noiDung: comment.trim() || undefined,
      });
      setReviewedProductIds((prev) => new Set(prev).add(activeProductId));
      setActiveProductId(null);
      setStars(5);
      setComment('');
      notifySuccess('Cảm ơn bạn đã đánh giá!');
      onReviewed?.();
    } catch (err) {
      notifyError(err, 'Gửi đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đánh giá đơn #{invoice?.invoiceCode ?? invoiceId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : !canReviewOrder ? (
          <p className="text-gray-600 text-sm py-4">
            Bạn chỉ có thể đánh giá sau khi đơn hàng hoàn thành.
          </p>
        ) : reviewableItems.length === 0 ? (
          <p className="text-gray-600 text-sm py-4">Không có sản phẩm để đánh giá trong đơn này.</p>
        ) : (
          <div className="space-y-4">
            {reviewableItems.map((item) => {
              const reviewed = reviewedProductIds.has(item.productId);
              const isActive = activeProductId === item.productId;
              return (
                <div key={item.productId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">Size {item.size}</p>
                    </div>
                    {reviewed ? (
                      <Badge className="bg-green-100 text-green-700">Đã đánh giá</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        className={isActive ? 'bg-[#8B7355] hover:bg-[#6F5B44]' : ''}
                        onClick={() => {
                          setActiveProductId(item.productId);
                          setStars(5);
                          setComment('');
                        }}
                      >
                        Đánh giá
                      </Button>
                    )}
                  </div>

                  {isActive && !reviewed && (
                    <div className="mt-4 space-y-3 pt-3 border-t">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Số sao của bạn</p>
                        <InteractiveStarRating value={stars} onChange={setStars} />
                      </div>
                      <Textarea
                        placeholder="Chia sẻ trải nghiệm (tùy chọn)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveProductId(null)}>
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#8B7355] hover:bg-[#6F5B44]"
                          disabled={submitting}
                          onClick={handleSubmit}
                        >
                          Gửi đánh giá
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function OrderReviewStars({ stars }: { stars: number }) {
  return <StarRating value={stars} size="sm" />;
}
