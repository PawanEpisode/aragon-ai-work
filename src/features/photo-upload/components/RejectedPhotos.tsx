import { Crop, TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MIN_REQUIRED_PHOTOS } from '../constants';
import { REJECTION_COPY, type RejectionReason, type UploadItem } from '../types';
import { PhotoCard } from './PhotoCard';
import { RejectionReasonLabel } from './RejectionReasonLabel';

interface RejectedPhotosProps {
  items: UploadItem[];
  acceptedCount: number;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCrop?: (id: string) => void;
}

/** Narrows an item to one whose status is `rejected`. */
function getReason(item: UploadItem): RejectionReason | null {
  return item.status.kind === 'rejected' ? item.status.reason : null;
}

export function RejectedPhotos({
  items,
  acceptedCount,
  onRemove,
  onRetry,
  onCrop,
}: RejectedPhotosProps) {
  if (items.length === 0) return null;

  const hasEnough = acceptedCount >= MIN_REQUIRED_PHOTOS;

  return (
    <Card className="border-rose-100 bg-rose-50/40 p-4">
      <header className="mb-4 flex items-center gap-2">
        <TriangleAlert className="size-5 text-rose-400" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Some Photos Didn&apos;t Meet Our Guidelines
          </h3>
          <p className="text-xs text-muted-foreground">
            {hasEnough
              ? `You can move to the next step as you've uploaded ${acceptedCount} good photos. Replacing these is optional.`
              : `Upload at least ${MIN_REQUIRED_PHOTOS} good photos to continue. Replace the photos below to improve your results.`}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const reason = getReason(item);
          if (!reason) return null;
          const canCrop = REJECTION_COPY[reason].canCrop;

          return (
            <PhotoCard
              key={item.id}
              src={item.previewUrl}
              alt={item.file.name}
              onRemove={() => onRemove(item.id)}
              footer={
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <RejectionReasonLabel reason={reason} />
                  <div className="flex items-center gap-2">
                    {canCrop && onCrop && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onCrop(item.id)}
                        className="h-7 px-2 text-xs text-muted-foreground"
                      >
                        <Crop className="size-3.5" />
                        Crop
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(item.id)}
                      className="h-7 px-2 text-xs text-brand-600 hover:text-brand-700"
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              }
            />
          );
        })}
      </div>
    </Card>
  );
}
