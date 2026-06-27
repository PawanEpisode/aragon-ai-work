/** Domain constants for the photo upload feature. */

/** MIME types the backend accepts. */
export const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/heic',
  'image/heif',
] as const;

/**
 * File extensions used as a fallback when the browser reports an empty MIME
 * type. HEIC files in particular frequently have no `file.type` in browsers.
 */
export const ACCEPTED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.heic',
  '.heif',
] as const;

/** Human readable list shown in the drop zone hint. */
export const ACCEPTED_LABEL = 'PNG, JPG, HEIC';

/** Maximum size of a single upload, in bytes (120 MB). */
export const MAX_FILE_SIZE_BYTES = 120 * 1024 * 1024;

/** Minimum number of accepted photos required to proceed. */
export const MIN_REQUIRED_PHOTOS = 6;

/** Target number of photos surfaced in the progress header (e.g. "7 of 10"). */
export const TARGET_PHOTOS = 10;

/** `accept` attribute value for the hidden file input. */
export const FILE_INPUT_ACCEPT = [...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(',');
