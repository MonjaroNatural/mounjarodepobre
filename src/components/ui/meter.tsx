'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'constructive' | 'destructive' | 'default';
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  ({ className, value, max = 5, variant = 'default', ...props }, ref) => {
    const percentage = (value / max) * 100;

    const blockClasses = {
      constructive: 'bg-green-500',
      destructive: 'bg-red-500',
      default: 'bg-gray-500',
    };

    return (
      <div
        ref={ref}
        className={cn('flex h-2 w-full gap-1 rounded-full bg-gray-200', className)}
        {...props}
      >
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full flex-1 rounded-sm',
              i < value ? blockClasses[variant] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    );
  }
);
Meter.displayName = 'Meter';

export { Meter };
