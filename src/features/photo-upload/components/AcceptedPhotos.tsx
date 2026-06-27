import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PhotoCard } from './PhotoCard';
import type { UploadItem } from '../types';

interface AcceptedPhotosProps {
  items: UploadItem[];
  onRemove: (id: string) => void;
}

export function AcceptedPhotos({ items, onRemove }: AcceptedPhotosProps) {
  if (items.length === 0) return null;

  return (
    <Card className="border-emerald-100 bg-emerald-50/40 p-4">
      <header className="mb-4 flex items-center gap-2">
        <CheckCircle2 className="size-5 text-emerald-500" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Accepted Photos</h3>
          <p className="text-xs text-muted-foreground">
            These images passed our scoring test and will all be used to generate
            your AI photos.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <PhotoCard
            key={item.id}
            src={item.previewUrl}
            alt={item.file.name}
            onRemove={() => onRemove(item.id)}
            topLeft={
              <span className="rounded-full bg-card/90 p-1 text-emerald-500 shadow-sm">
                <CheckCircle2 className="size-4" />
              </span>
            }
          />
        ))}
      </div>
    </Card>
  );
}
