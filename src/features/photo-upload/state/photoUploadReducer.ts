import type { UploadItem } from '../types';
import type { UploadAction } from './actions';

export type UploadState = {
  /** Ordered list of items as they were added. */
  items: UploadItem[];
};

export const initialUploadState: UploadState = { items: [] };

/** Immutably updates a single item identified by `id`. */
function updateItem(
  state: UploadState,
  id: string,
  update: (item: UploadItem) => UploadItem,
): UploadState {
  return {
    ...state,
    items: state.items.map((item) => (item.id === id ? update(item) : item)),
  };
}

export function photoUploadReducer(
  state: UploadState,
  action: UploadAction,
): UploadState {
  switch (action.type) {
    case 'ADD_ITEMS':
      return { ...state, items: [...state.items, ...action.items] };

    case 'SET_PROGRESS':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: { kind: 'uploading', progress: action.progress },
      }));

    case 'SET_PROCESSING':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: { kind: 'processing' },
      }));

    case 'SET_ACCEPTED':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: {
          kind: 'accepted',
          remoteId: action.remoteId,
          remoteUrl: action.remoteUrl,
        },
      }));

    case 'SET_REJECTED':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: {
          kind: 'rejected',
          remoteId: action.remoteId,
          remoteUrl: action.remoteUrl,
          reason: action.reason,
        },
      }));

    case 'SET_ERROR':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: { kind: 'error', message: action.message },
      }));

    case 'RESET_ITEM':
      return updateItem(state, action.id, (item) => ({
        ...item,
        status: { kind: 'pending' },
      }));

    case 'REPLACE_FILE':
      return updateItem(state, action.id, (item) => ({
        ...item,
        file: action.file,
        previewUrl: action.previewUrl,
        status: { kind: 'pending' },
      }));

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };

    default:
      return state;
  }
}
