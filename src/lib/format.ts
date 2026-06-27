/** Formats a byte count into a human-readable string (e.g. "4.2 MB"). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** Truncates a long filename while preserving its extension. */
export function truncateFileName(name: string, max = 28): string {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return `${name.slice(0, max - 1)}…`;
  const ext = name.slice(dot);
  const base = name.slice(0, dot);
  const keep = Math.max(1, max - ext.length - 1);
  return `${base.slice(0, keep)}…${ext}`;
}
