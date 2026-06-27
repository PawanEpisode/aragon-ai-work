import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with `clsx` and resolves Tailwind conflicts with
 * `tailwind-merge`. This is the shadcn/ui standard `cn` helper.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
