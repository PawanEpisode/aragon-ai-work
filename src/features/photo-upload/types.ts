/** Domain types for the photo upload feature. */

/** Reasons a photo can fail the backend quality scoring. */
export type RejectionReason =
  | 'blurry_face'
  | 'face_too_far'
  | 'too_similar'
  | 'no_face'
  | 'unsupported';

/** Copy + behaviour metadata for each rejection reason. */
export interface RejectionCopy {
  /** Short label shown under the rejected card (e.g. "Blurry face detected"). */
  label: string;
  /** Tooltip title shown on hover. */
  title: string;
  /** Tooltip helper text explaining how to fix the issue. */
  hint: string;
  /** Whether a "Crop" action makes sense for this reason. */
  canCrop: boolean;
}

export const REJECTION_COPY: Record<RejectionReason, RejectionCopy> = {
  blurry_face: {
    label: 'Blurry face detected',
    title: 'Try again',
    hint: 'We detected a blurry face. Please ensure the face is in focus.',
    canCrop: false,
  },
  face_too_far: {
    label: 'Face is too far away',
    title: 'Try again',
    hint: 'The face is too far from the camera. Crop closer or upload a new photo.',
    canCrop: true,
  },
  too_similar: {
    label: 'Too similar to another upload',
    title: 'Try again',
    hint: 'This photo is too similar to another upload. Try a different pose or setting.',
    canCrop: false,
  },
  no_face: {
    label: 'No face detected',
    title: 'Try again',
    hint: 'We could not detect a face in this photo. Please upload a clear portrait.',
    canCrop: false,
  },
  unsupported: {
    label: 'Unsupported image',
    title: 'Try again',
    hint: 'This image could not be processed. Please upload a different photo.',
    canCrop: false,
  },
};

/**
 * Discriminated union describing where an upload item is in its lifecycle:
 * `pending -> uploading -> processing -> accepted | rejected | error`.
 */
export type UploadStatus =
  | { kind: 'pending' }
  | { kind: 'uploading'; progress: number }
  | { kind: 'processing' }
  | { kind: 'accepted'; remoteId: string; remoteUrl: string }
  | { kind: 'rejected'; remoteId: string; remoteUrl: string; reason: RejectionReason }
  | { kind: 'error'; message: string };

/** A single file moving through the upload pipeline. */
export interface UploadItem {
  /** Stable client-generated id (independent of the backend id). */
  id: string;
  file: File;
  /** Object URL used for the local preview thumbnail. */
  previewUrl: string;
  status: UploadStatus;
}

/** Result returned by the scoring endpoint for a single photo. */
export type ScoreResult =
  | { id: string; status: 'accepted' }
  | { id: string; status: 'rejected'; reason: RejectionReason };

/** Successful upload response for a single file. */
export interface UploadResult {
  id: string;
  url: string;
}
