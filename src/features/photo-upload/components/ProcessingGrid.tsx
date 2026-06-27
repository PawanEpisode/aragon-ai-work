import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import type { UploadItem } from '../types';
import { PhotoCard } from './PhotoCard';

interface ProcessingGridProps {
  items: UploadItem[];
}

/** Blurred previews shown while uploads are verified, matching the live UX. */
export function ProcessingGrid({ items }: ProcessingGridProps) {
  if (items.length === 0) return null;

  return (
    <Card className="p-4">
      <p className="mb-4 text-xs text-muted-foreground">
        You&apos;re almost there! We&apos;re just verifying the quality of your
        uploads to make sure you get the best results.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const progress =
            item.status.kind === 'uploading' ? item.status.progress : null;
          return (
            <PhotoCard
              key={item.id}
              src={item.previewUrl}
              alt={item.file.name}
              blurred
              centerOverlay={
                <>
                  <Spinner size={22} label="Verifying" />
                  {progress !== null && (
                    <span className="text-xs font-medium tabular-nums">
                      {progress}%
                    </span>
                  )}
                </>
              }
            />
          );
        })}
      </div>
    </Card>
  );
}
