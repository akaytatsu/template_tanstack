import { describe, it, expect } from 'vitest'
import { cn, safeFormatDistanceToNow } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/user-utils'

describe('cn', () => {
  it('merges class names and dedupes conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    const isHidden = false as boolean
    expect(cn('text-on-surface', isHidden && 'hidden', 'font-medium')).toBe(
      'text-on-surface font-medium',
    )
  })
})

describe('safeFormatDistanceToNow', () => {
  it('returns a placeholder for empty or invalid dates', () => {
    expect(safeFormatDistanceToNow(null)).toBe('—')
    expect(safeFormatDistanceToNow('not-a-date')).toBe('—')
  })

  it('formats a valid ISO date', () => {
    const result = safeFormatDistanceToNow(new Date().toISOString())
    expect(result).toContain('ago')
  })
})

describe('getInitials / getAvatarColor', () => {
  it('derives initials from a full name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
    expect(getInitials('Grace')).toBe('GR')
    expect(getInitials('')).toBe('?')
  })

  it('is deterministic for the same name', () => {
    expect(getAvatarColor('Ada Lovelace')).toBe(getAvatarColor('Ada Lovelace'))
  })
})
