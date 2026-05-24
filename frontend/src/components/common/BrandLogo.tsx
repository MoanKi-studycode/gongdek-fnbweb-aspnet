const SIZE_CLASS = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
} as const;

export type BrandLogoSize = keyof typeof SIZE_CLASS;

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  showRing?: boolean;
}

/** Logo GongDek — file tại public/images/icons/icon.png */
export function BrandLogo({ size = 'sm', className = '', showRing = true }: BrandLogoProps) {
  return (
    <img
      src="/images/icons/icon.png"
      alt="GongDek Tea & Coffee"
      className={[
        SIZE_CLASS[size],
        'rounded-full object-cover object-center shrink-0',
        showRing ? 'ring-1 ring-[#8B7355]/20' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
