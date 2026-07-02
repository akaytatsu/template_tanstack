/**
 * Small presentation helpers for user avatars.
 * Kept dependency-free so any component can use them.
 */

/** Returns up to two uppercase initials from a name (falls back to "?"). */
export function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic palette using the design-system surface/brand tokens.
const AVATAR_COLORS = [
  'bg-surface-container-high text-k-primary',
  'bg-surface-container-high text-k-secondary',
  'bg-surface-container-high text-k-warning',
  'bg-surface-container-high text-on-surface',
] as const

/** Picks a stable avatar color class from a name. */
export function getAvatarColor(name: string | undefined | null): string {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
