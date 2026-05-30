import { Star } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({ value, max = 5, size = 'md', className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${value} trên ${max} sao`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <Star
            key={i}
            className={cn(sizeMap[size], filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
          />
        );
      })}
    </div>
  );
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveStarRating({ value, onChange, size = 'lg' }: InteractiveStarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 rounded hover:scale-110 transition-transform"
            aria-label={`${star} sao`}
          >
            <Star
              className={cn(
                sizeMap[size],
                active ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
