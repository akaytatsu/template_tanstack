/**
 * Central place for the app's branding/identity.
 *
 * These defaults are what `scripts/rename-app.mjs` rewrites when you
 * bootstrap a new project. Search tokens (kept intentionally distinctive
 * so a find/replace is safe):
 *   - "tanstack-start-template"   → package/image/container/project slug
 *   - "TanStack Start Template"   → human-readable title
 */
export const SITE = {
  /** Human-readable title — <title>, page headers, PWA name. */
  name: 'TanStack Start Template',
  /** Short brand label — sidebar logo, PWA short_name. */
  shortName: 'Template',
  /** One-line description — <meta name="description"> and manifest. */
  description: 'TanStack Start template app.',
  /** Browser/PWA theme color (matches the dark surface). */
  themeColor: '#111319',
} as const
