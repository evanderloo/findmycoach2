import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, alt, fallback, size = 48, className }: AvatarProps) {
  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold', className)}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes={`${size}px`} />
      ) : (
        <span>{fallback ?? alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
