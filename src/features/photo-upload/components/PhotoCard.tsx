import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  src: string;
  alt: string;
  /** Blurs the image, e.g. while the backend is verifying quality. */
  blurred?: boolean;
  onRemove?: () => void;
  /** Overlay rendered in the center of the image (spinner, progress). */
  centerOverlay?: ReactNode;
  /** Badge rendered in the top-left corner (status). */
  topLeft?: ReactNode;
  /** Content rendered below the image (reason label, actions). */
  footer?: ReactNode;
  className?: string;
}

export function PhotoCard({
  src,
  alt,
  blurred,
  onRemove,
  centerOverlay,
  topLeft,
  footer,
  className,
}: PhotoCardProps) {
  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition',
            blurred && 'scale-105 blur-md',
          )}
        />

        {topLeft && <div className="absolute left-2 top-2">{topLeft}</div>}

        {onRemove && (
          <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Remove ${alt}`}
              onClick={onRemove}
              className="size-8 rounded-full bg-card/90 text-muted-foreground hover:bg-card hover:text-foreground"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}

        {centerOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/10 text-white">
            {centerOverlay}
          </div>
        )}
      </div>

      {footer}
    </figure>
  );
}
