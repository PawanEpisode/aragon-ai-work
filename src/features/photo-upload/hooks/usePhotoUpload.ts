import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { partitionFiles, type ValidationResult } from '../validation/fileValidation';
import {
  initialUploadState,
  photoUploadReducer,
} from '../state/photoUploadReducer';
import { photoApi as defaultPhotoApi, type PhotoApi } from '../services/photoApi';
import type { UploadItem } from '../types';

function isAbort(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof DOMException && error.name === 'AbortError')
  );
}

/** Side-effect callbacks the consuming component can hook into (e.g. toasts). */
export interface UploadCallbacks {
  /** Fired once per rejected-at-validation file (wrong type / too large). */
  onInvalidFile?: (file: File, result: Extract<ValidationResult, { valid: false }>) => void;
  /** Fired when a batch of uploads finishes (any reached a terminal state). */
  onBatchComplete?: (summary: { uploaded: number; failed: number }) => void;
}

export interface UsePhotoUploadOptions extends UploadCallbacks {
  /** Injectable API for testing / local mocks. Defaults to the HTTP client. */
  api?: PhotoApi;
}

function createId(): string {
  return crypto.randomUUID();
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const { api = defaultPhotoApi, onInvalidFile, onBatchComplete } = options;

  const [state, dispatch] = useReducer(photoUploadReducer, initialUploadState);

  // Upload + scoring run through react-query mutations: this gives us a single
  // async boundary, centralised error semantics and Devtools visibility, while
  // per-item UI state still lives in the reducer.
  const uploadMutation = useMutation({
    mutationFn: (vars: {
      file: File;
      signal: AbortSignal;
      onProgress: (progress: number) => void;
    }) => api.upload(vars.file, { signal: vars.signal, onProgress: vars.onProgress }),
  });
  const scoreMutation = useMutation({
    mutationFn: (remoteIds: string[]) => api.score(remoteIds),
  });
  const { mutateAsync: uploadAsync } = uploadMutation;
  const { mutateAsync: scoreAsync } = scoreMutation;

  // Mutable refs that must survive re-renders without triggering them.
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Mirror of the current items so stable callbacks can read fresh state.
  const itemsRef = useRef<UploadItem[]>(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  // Keep the latest callbacks in a ref so `processItem` stays stable.
  const callbacksRef = useRef<UploadCallbacks>({ onInvalidFile, onBatchComplete });
  useEffect(() => {
    callbacksRef.current = { onInvalidFile, onBatchComplete };
  }, [onInvalidFile, onBatchComplete]);

  // Revoke any object URLs still alive when the component unmounts.
  useEffect(() => {
    const urls = objectUrlsRef.current;
    const controllers = controllersRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  const runItem = useCallback(
    async (item: UploadItem): Promise<'uploaded' | 'failed'> => {
      const controller = new AbortController();
      controllersRef.current.set(item.id, controller);

      try {
        dispatch({ type: 'SET_PROGRESS', id: item.id, progress: 0 });

        const { id: remoteId, url: remoteUrl } = await uploadAsync({
          file: item.file,
          signal: controller.signal,
          onProgress: (progress) =>
            dispatch({ type: 'SET_PROGRESS', id: item.id, progress }),
        });

        dispatch({ type: 'SET_PROCESSING', id: item.id });

        const [result] = await scoreAsync([remoteId]);

        if (result?.status === 'rejected') {
          dispatch({
            type: 'SET_REJECTED',
            id: item.id,
            remoteId,
            remoteUrl,
            reason: result.reason,
          });
        } else {
          dispatch({ type: 'SET_ACCEPTED', id: item.id, remoteId, remoteUrl });
        }
        return 'uploaded';
      } catch (error) {
        if (isAbort(error)) return 'failed';
        const message =
          error instanceof Error ? error.message : 'Upload failed unexpectedly.';
        dispatch({ type: 'SET_ERROR', id: item.id, message });
        return 'failed';
      } finally {
        controllersRef.current.delete(item.id);
      }
    },
    [uploadAsync, scoreAsync],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const { valid, invalid } = partitionFiles(files);

      for (const { file, result } of invalid) {
        callbacksRef.current.onInvalidFile?.(file, result);
      }

      if (valid.length === 0) return;

      const items: UploadItem[] = valid.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(previewUrl);
        return { id: createId(), file, previewUrl, status: { kind: 'pending' } };
      });

      dispatch({ type: 'ADD_ITEMS', items });

      const outcomes = await Promise.all(items.map(runItem));
      const uploaded = outcomes.filter((o) => o === 'uploaded').length;
      const failed = outcomes.length - uploaded;
      callbacksRef.current.onBatchComplete?.({ uploaded, failed });
    },
    [runItem],
  );

  const remove = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);

    const target = itemsRef.current.find((item) => item.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      objectUrlsRef.current.delete(target.previewUrl);
    }

    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (item) void runItem(item);
    },
    [runItem],
  );

  /** Swaps an item's file (e.g. after cropping) and re-runs the pipeline. */
  const replaceFile = useCallback(
    (id: string, file: File) => {
      const existing = itemsRef.current.find((entry) => entry.id === id);
      if (!existing) return;

      URL.revokeObjectURL(existing.previewUrl);
      objectUrlsRef.current.delete(existing.previewUrl);

      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(previewUrl);

      dispatch({ type: 'REPLACE_FILE', id, file, previewUrl });
      void runItem({ ...existing, file, previewUrl, status: { kind: 'pending' } });
    },
    [runItem],
  );

  const derived = useMemo(() => {
    const accepted = state.items.filter((i) => i.status.kind === 'accepted');
    const rejected = state.items.filter((i) => i.status.kind === 'rejected');
    const inProgress = state.items.filter(
      (i) =>
        i.status.kind === 'pending' ||
        i.status.kind === 'uploading' ||
        i.status.kind === 'processing',
    );
    const errored = state.items.filter((i) => i.status.kind === 'error');
    return {
      accepted,
      rejected,
      inProgress,
      errored,
      acceptedCount: accepted.length,
      isUploading: inProgress.length > 0,
    };
  }, [state.items]);

  return {
    items: state.items,
    ...derived,
    addFiles,
    remove,
    retry,
    replaceFile,
  };
}
