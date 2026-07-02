import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string relative to now.
 * Returns a fallback string instead of throwing if the date is invalid.
 */
export function safeFormatDistanceToNow(
  dateString: string | undefined | null,
  options?: { addSuffix?: boolean },
): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return formatDistanceToNow(date, { addSuffix: options?.addSuffix ?? true })
  } catch {
    return '—'
  }
}
