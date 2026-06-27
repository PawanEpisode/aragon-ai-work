import { Progress } from '@/components/ui/progress';
import { TARGET_PHOTOS } from '../constants';

interface ProgressHeaderProps {
  acceptedCount: number;
  target?: number;
}

export function ProgressHeader({
  acceptedCount,
  target = TARGET_PHOTOS,
}: ProgressHeaderProps) {
  const percent = Math.min(100, Math.round((acceptedCount / target) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-foreground">Uploaded Images</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {acceptedCount} <span className="text-muted-foreground/70">of {target}</span>
        </span>
      </div>
      <Progress
        value={percent}
        aria-label="Accepted photos progress"
        indicatorClassName="bg-gradient-to-r from-rose-500 via-brand-500 to-amber-400"
      />
    </div>
  );
}
