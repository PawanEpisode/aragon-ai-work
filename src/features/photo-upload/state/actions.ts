import type { RejectionReason, UploadItem } from '../types';

/** All mutations that can be applied to the upload collection. */
export type UploadAction =
  | { type: 'ADD_ITEMS'; items: UploadItem[] }
  | { type: 'SET_PROGRESS'; id: string; progress: number }
  | { type: 'SET_PROCESSING'; id: string }
  | { type: 'SET_ACCEPTED'; id: string; remoteId: string; remoteUrl: string }
  | {
      type: 'SET_REJECTED';
      id: string;
      remoteId: string;
      remoteUrl: string;
      reason: RejectionReason;
    }
  | { type: 'SET_ERROR'; id: string; message: string }
  | { type: 'REPLACE_FILE'; id: string; file: File; previewUrl: string }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'RESET_ITEM'; id: string };
