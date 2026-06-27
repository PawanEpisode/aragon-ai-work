import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { REJECTION_COPY, type RejectionReason } from '../types';

interface RejectionReasonLabelProps {
  reason: RejectionReason;
}

export function RejectionReasonLabel({ reason }: RejectionReasonLabelProps) {
  const copy = REJECTION_COPY[reason];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="cursor-help text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-2"
        >
          {copy.label}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-1.5 font-semibold text-rose-300">
          <AlertCircle className="size-3.5" />
          {copy.title}
        </span>
        <span className="mt-1 block text-gray-200">{copy.hint}</span>
      </TooltipContent>
    </Tooltip>
  );
}
