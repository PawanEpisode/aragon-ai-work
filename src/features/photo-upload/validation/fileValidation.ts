import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../constants';

/** Why a file was rejected before it was ever uploaded. */
export type ValidationErrorCode = 'unsupported_type' | 'too_large' | 'empty_file';

export type ValidationResult =
  | { valid: true }
  | { valid: false; code: ValidationErrorCode; message: string };

const acceptedMimeSet = new Set<string>(ACCEPTED_MIME_TYPES);

function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Pure, framework-agnostic validator. The browser frequently reports an empty
 * MIME type for HEIC/HEIF, so we fall back to checking the file extension.
 */
export function validateFile(file: File): ValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      code: 'empty_file',
      message: `${file.name} is empty.`,
    };
  }

  const typeAllowed = file.type !== '' && acceptedMimeSet.has(file.type);
  if (!typeAllowed && !hasAcceptedExtension(file.name)) {
    return {
      valid: false,
      code: 'unsupported_type',
      message: `${file.name} is not a supported format. Use PNG, JPG, or HEIC.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'too_large',
      message: `${file.name} exceeds the 120MB limit.`,
    };
  }

  return { valid: true };
}

/** Splits a list of files into those that pass validation and those that fail. */
export function partitionFiles(files: File[]): {
  valid: File[];
  invalid: Array<{ file: File; result: Extract<ValidationResult, { valid: false }> }>;
} {
  const valid: File[] = [];
  const invalid: Array<{
    file: File;
    result: Extract<ValidationResult, { valid: false }>;
  }> = [];

  for (const file of files) {
    const result = validateFile(file);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, result });
    }
  }

  return { valid, invalid };
}
