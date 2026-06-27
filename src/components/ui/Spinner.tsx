import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  /** Pixel size of the spinner. Defaults to 16. */
  size?: number;
  label?: string;
}

export function Spinner({ className, size = 16, label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin', className)}
      style={{ width: size, height: size }}
    />
  );
}
