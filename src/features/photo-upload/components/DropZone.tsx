import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCEPTED_LABEL } from '../constants';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  isUploading: boolean;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, isUploading, disabled }: DropZoneProps) {
  // We accept every file here and let our own validator (partitionFiles) decide,
  // because browsers report an empty MIME type for HEIC which react-dropzone's
  // `accept` filter would otherwise reject.
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFilesAdded(accepted);
    },
    [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      onClick={open}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors',
        isDragActive
          ? 'border-brand-400 bg-brand-50'
          : 'border-border bg-muted/40 hover:bg-muted/70',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <input {...getInputProps()} />

      <Button
        type="button"
        disabled={disabled || isUploading}
        onClick={(event) => {
          event.stopPropagation();
          open();
        }}
        className={cn(isUploading && 'cursor-wait')}
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload />
            Upload files
          </>
        )}
      </Button>

      <p className="mt-3 text-sm font-medium text-foreground">
        Click to upload or drag and drop
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {ACCEPTED_LABEL} up to 120MB
      </p>
    </div>
  );
}
