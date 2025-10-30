import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success';
};

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-900 text-white',
  outline: 'border border-slate-200 text-slate-900',
  success: 'bg-green-500 text-white',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[variant], className)}
      {...props}
    />
  );
}
