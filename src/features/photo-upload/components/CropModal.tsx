import { useCallback, useRef, useState } from 'react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface CropModalProps {
  imageSrc: string;
  fileName: string;
  /** Crop aspect ratio (width / height). Defaults to the 3:4 card ratio. */
  aspect?: number;
  onCancel: () => void;
  onApply: (file: File) => void;
}

/** HEIC is not canvas-encodable, so cropped output is normalised to JPEG. */
function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export cropped image'));
          return;
        }
        const baseName = fileName.replace(/\.[^.]+$/, '');
        resolve(new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  });
}

export function CropModal({
  imageSrc,
  fileName,
  aspect = 3 / 4,
  onCancel,
  onApply,
}: CropModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setIsSaving(true);
    setError(null);
    try {
      const canvas = cropper.getCroppedCanvas();
      if (!canvas) throw new Error('Could not read the crop selection');
      const file = await canvasToFile(canvas, fileName);
      onApply(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not crop the image.');
      setIsSaving(false);
    }
  }, [fileName, onApply]);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b px-5 py-3">
          <DialogTitle>Crop photo</DialogTitle>
        </DialogHeader>

        <div className="bg-gray-900">
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            aspectRatio={aspect}
            viewMode={1}
            guides
            background={false}
            autoCropArea={1}
            responsive
            style={{ height: '55vh', width: '100%' }}
          />
        </div>

        <div className="space-y-3 px-5 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isSaving}>
              {isSaving && <Spinner size={16} label="Saving" />}
              Apply &amp; re-upload
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
