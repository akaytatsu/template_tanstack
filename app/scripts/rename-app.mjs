#!/usr/bin/env node
/**
 * Rebrands the template for a new project in one shot.
 *
 *   node scripts/rename-app.mjs <slug> "<Title>" [shortName]
 *
 * Example:
 *   node scripts/rename-app.mjs acme-console "Acme Console" Acme
 *
 * Replaces the template's default identity tokens across the repo:
 *   - "tanstack-start-template"  → <slug>   (package name, image, container, PROJECT_NAME)
 *   - "TanStack Start Template"  → <Title>  (page titles, manifest, SITE.name)
 *   - short name "Template"      → <shortName> (SITE.shortName, manifest short_name)
 *
 * Idempotent-ish: run it once right after cloning. Re-running with the same
 * args is a no-op.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const SLUG_DEFAULT = 'tanstack-start-template'
const TITLE_DEFAULT = 'TanStack Start Template'
const SHORT_DEFAULT = 'Template'

const [slug, title, shortName = title] = process.argv.slice(2)

if (!slug || !title) {
  console.error('Usage: node scripts/rename-app.mjs <slug> "<Title>" [shortName]')
  process.exit(1)
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid slug "${slug}" — use lowercase letters, digits and dashes.`)
  process.exit(1)
}

// Repo root is two levels up from this script (app/scripts → repo root).
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

// Files that carry branding, relative to the repo root.
const files = [
  'app/package.json',
  'app/index.html',
  'app/public/manifest.webmanifest',
  'app/src/lib/site.ts',
  'Makefile',
  'docker-compose.override.yml',
  'build-and-push.sh',
  'README.md',
]

// Order matters: replace the short name's specific occurrences first so the
// broad title/slug passes don't clobber them.
const shortReplacements = [
  [`shortName: '${SHORT_DEFAULT}'`, `shortName: '${shortName}'`],
  [`"short_name": "${SHORT_DEFAULT}"`, `"short_name": "${shortName}"`],
]

let changed = 0
for (const rel of files) {
  const path = join(repoRoot, rel)
  let content
  try {
    content = await readFile(path, 'utf8')
  } catch {
    continue // file is optional
  }
  const before = content
  for (const [from, to] of shortReplacements) content = content.split(from).join(to)
  content = content.split(TITLE_DEFAULT).join(title)
  content = content.split(SLUG_DEFAULT).join(slug)
  if (content !== before) {
    await writeFile(path, content, 'utf8')
    console.log(`  updated ${rel}`)
    changed++
  }
}

console.log(
  changed
    ? `\nDone. Renamed to "${title}" (${slug}). Review the diff, then commit.`
    : '\nNothing to change (already renamed?).',
)
