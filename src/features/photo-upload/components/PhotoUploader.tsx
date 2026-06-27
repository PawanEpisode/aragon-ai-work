import { lazy, Suspense, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Flame, ImagePlus } from 'lucide-react';
import { usePhotoUpload, type UploadCallbacks } from '../hooks/usePhotoUpload';
import type { UploadItem } from '../types';
import { AcceptedPhotos } from './AcceptedPhotos';
import { DropZone } from './DropZone';
import { ProcessingGrid } from './ProcessingGrid';
import { ProgressHeader } from './ProgressHeader';
import { RejectedPhotos } from './RejectedPhotos';
import { UploadProgressList } from './UploadProgressList';

// The cropper (cropperjs) is heavy and only needed on demand.
const CropModal = lazy(() =>
  import('./CropModal').then((m) => ({ default: m.CropModal })),
);

export function PhotoUploader() {
  const onInvalidFile = useCallback<NonNullable<UploadCallbacks['onInvalidFile']>>(
    (_file, result) => {
      toast.error(result.message);
    },
    [],
  );

  const onBatchComplete = useCallback<
    NonNullable<UploadCallbacks['onBatchComplete']>
  >(({ uploaded, failed }) => {
    if (uploaded > 0) {
      toast.success('Your photos have been successfully uploaded!');
    }
    if (failed > 0) {
      toast.error(`${failed} photo${failed > 1 ? 's' : ''} could not be uploaded.`);
    }
  }, []);

  const {
    items,
    accepted,
    rejected,
    inProgress,
    errored,
    acceptedCount,
    isUploading,
    addFiles,
    remove,
    retry,
    replaceFile,
  } = usePhotoUpload({ onInvalidFile, onBatchComplete });

  const [cropTarget, setCropTarget] = useState<UploadItem | null>(null);

  const onCrop = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (item) setCropTarget(item);
    },
    [items],
  );

  const handleCropApply = useCallback(
    (file: File) => {
      if (cropTarget) replaceFile(cropTarget.id, file);
      setCropTarget(null);
    },
    [cropTarget, replaceFile],
  );

  const hasContent = items.length > 0;
  const listItems = [...inProgress, ...errored];

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Flame className="size-6 text-brand-500" />
          <span className="text-lg font-semibold text-foreground">Aragon.ai</span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Upload photos</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Now the fun begins! Select at least{' '}
              <strong className="text-foreground">6 of your best photos</strong>.
              Uploading a mix of close-ups, selfies and mid-range shots can help the
              AI better capture your face and body type.
            </p>
          </div>

          <DropZone onFilesAdded={addFiles} isUploading={isUploading} />

          <UploadProgressList items={listItems} onRetry={retry} onRemove={remove} />
        </aside>

        <main className="space-y-6">
          <ProgressHeader acceptedCount={acceptedCount} />

          {!hasContent && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <ImagePlus className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Your uploaded photos will appear here.
              </p>
            </div>
          )}

          <ProcessingGrid items={inProgress} />

          <AcceptedPhotos items={accepted} onRemove={remove} />

          <RejectedPhotos
            items={rejected}
            acceptedCount={acceptedCount}
            onRemove={remove}
            onRetry={retry}
            onCrop={onCrop}
          />
        </main>
      </div>

      {cropTarget && (
        <Suspense fallback={null}>
          <CropModal
            imageSrc={cropTarget.previewUrl}
            fileName={cropTarget.file.name}
            onCancel={() => setCropTarget(null)}
            onApply={handleCropApply}
          />
        </Suspense>
      )}
    </div>
  );
}
