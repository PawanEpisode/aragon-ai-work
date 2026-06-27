/**
 * Centralised, typed access to build-time environment configuration.
 * Keeping this in one place means components/services never read
 * `import.meta.env` directly.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const env = {
  /**
   * Base URL of the photo backend API. Falls back to `/api` so the app can be
   * served behind a reverse proxy without extra configuration.
   */
  apiBaseUrl: (rawBaseUrl ?? '/api').replace(/\/$/, ''),
} as const;
