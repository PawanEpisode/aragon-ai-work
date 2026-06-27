import { ImageIcon, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { truncateFileName } from '@/lib/format';
import type { UploadItem } from '../types';

interface UploadProgressListProps {
  items: UploadItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

function StatusIndicator({
  item,
  onRetry,
}: {
  item: UploadItem;
  onRetry: (id: string) => void;
}) {
  switch (item.status.kind) {
    case 'uploading':
      return (
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{item.status.progress}%</span>
          <Spinner size={14} className="text-brand-400" label="Uploading" />
        </span>
      );
    case 'pending':
    case 'processing':
      return <Spinner size={14} className="text-brand-400" label="Processing" />;
    case 'error':
      return (
        <button
          type="button"
          onClick={() => onRetry(item.id)}
          className="text-xs font-semibold text-destructive underline-offset-2 hover:underline"
        >
          Retry
        </button>
      );
    default:
      return null;
  }
}

export function UploadProgressList({
  items,
  onRetry,
  onRemove,
}: UploadProgressListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        It can take up to 1 minute to upload
      </p>
      <ul className="space-y-2">
        {items.map((item) => {
          const isError = item.status.kind === 'error';
          return (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border bg-card px-3 py-2',
                isError ? 'border-destructive/40' : 'border-border',
              )}
            >
              <ImageIcon className="size-[18px] shrink-0 text-muted-foreground/60" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-foreground">
                  {truncateFileName(item.file.name)}
                </span>
                {item.status.kind === 'error' && (
                  <span className="block truncate text-[11px] text-destructive">
                    {item.status.message}
                  </span>
                )}
              </span>
              <StatusIndicator item={item} onRetry={onRetry} />
              <button
                type="button"
                aria-label={`Remove ${item.file.name}`}
                onClick={() => onRemove(item.id)}
                className="text-muted-foreground/60 transition hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
