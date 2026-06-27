import axios from 'axios';
import { z } from 'zod';
import { env } from '@/config/env';
import type { ScoreResult, UploadResult } from '../types';

/** Shared axios instance pointed at the photo backend. */
export const http = axios.create({ baseURL: env.apiBaseUrl });

export interface UploadOptions {
  /** Called with an integer 0..100 as the upload progresses. */
  onProgress?: (progress: number) => void;
  /** Allows the caller to cancel an in-flight upload. */
  signal?: AbortSignal;
}

/* ---- Runtime response schemas (zod) ---------------------------------- */

const uploadResultSchema = z.object({
  id: z.string(),
  url: z.string(),
});

const rejectionReasonSchema = z.enum([
  'blurry_face',
  'face_too_far',
  'too_similar',
  'no_face',
  'unsupported',
]);

const scoreResultSchema = z.array(
  z.discriminatedUnion('status', [
    z.object({ id: z.string(), status: z.literal('accepted') }),
    z.object({
      id: z.string(),
      status: z.literal('rejected'),
      reason: rejectionReasonSchema,
    }),
  ]),
);

/**
 * Backend-agnostic boundary for the photo pipeline. Components/hooks depend on
 * this interface, so the HTTP implementation can be swapped for a mock without
 * touching the UI.
 */
export interface PhotoApi {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>;
  score(remoteIds: string[]): Promise<ScoreResult[]>;
}

/**
 * Default implementation talking to the real backend.
 *
 * Assumed contract:
 *   POST {BASE}/photos        (multipart, field "file") -> { id, url }
 *   POST {BASE}/photos/score  body { ids: string[] }    -> ScoreResult[]
 */
export const photoApi: PhotoApi = {
  async upload(file, { onProgress, signal } = {}) {
    const form = new FormData();
    form.append('file', file, file.name);

    const { data } = await http.post('/photos', form, {
      signal,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    return uploadResultSchema.parse(data);
  },

  async score(remoteIds) {
    const { data } = await http.post('/photos/score', { ids: remoteIds });
    return scoreResultSchema.parse(data);
  },
};
