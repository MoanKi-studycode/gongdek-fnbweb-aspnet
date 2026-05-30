import { StarRating } from '@/components/reviews/StarRating';
import { formatReviewRating } from '@/services/reviewService';
import type { ProductReviewSummary } from '@/types/modules';

interface ProductReviewBadgeProps {
  summary?: ProductReviewSummary | null;
  onClick?: () => void;
  className?: string;
}

export function ProductReviewBadge({ summary, onClick, className }: ProductReviewBadgeProps) {
  if (!summary || summary.count === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`text-xs text-gray-400 hover:text-[#8B7355] ${className ?? ''}`}
      >
        Chưa có đánh giá
      </button>
    );
  }

  const content = (
    <>
      <StarRating value={summary.averageRating} size="sm" />
      <span className="text-sm font-medium text-amber-700">{formatReviewRating(summary.averageRating)}</span>
      <span className="text-xs text-gray-500">({summary.count})</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 hover:opacity-80 ${className ?? ''}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>{content}</div>;
}
