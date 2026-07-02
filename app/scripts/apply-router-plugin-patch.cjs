#!/usr/bin/env node
/**
 * Patches @tanstack/router-plugin's react-refresh-ignored-route-exports to
 * inline `import.meta.hot` directly, eliminating any program-scope variable
 * declaration. This avoids "Duplicate declaration" collisions within the
 * code-splitter's Babel pipeline (the variable at program scope collides
 * with the code-splitter's HMR plugin which also references `import.meta.hot`).
 *
 * Applies the same change to both CJS and ESM builds.
 * Idempotent — skips if the patch is already present.
 */

const fs = require('fs')
const path = require('path')

const RELATIVE_TARGETS = [
  'dist/cjs/core/code-splitter/plugins/react-refresh-ignored-route-exports.cjs',
  'dist/esm/core/code-splitter/plugins/react-refresh-ignored-route-exports.js',
]

function resolvePackageRoot() {
  const candidates = [
    path.resolve(process.cwd(), 'node_modules', '@tanstack', 'router-plugin'),
    path.resolve(__dirname, '..', 'node_modules', '@tanstack', 'router-plugin'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  let dir = process.cwd()
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', '@tanstack', 'router-plugin')
    if (fs.existsSync(candidate)) {
      return candidate
    }
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const inner = path.join(dir, 'node_modules', '@tanstack', 'router-plugin')
      if (fs.existsSync(inner)) return inner
    }
    dir = path.dirname(dir)
  }

  return null
}

/**
 * Replaces the template in the target file from:
 *
 *   const hot = import.meta.hot
 *   if (hot && typeof window !== 'undefined') {
 *     hot.data ??= {}
 *
 * to:
 *
 *   if (import.meta.hot && typeof window !== 'undefined') {
 *     import.meta.hot.data ??= {}
 *
 * This avoids declaring ANY variable at program scope, eliminating
 * the root cause of the "Duplicate declaration" error.
 */
function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠  not found: ${filePath}`)
    return false
  }

  const content = fs.readFileSync(filePath, 'utf8')

  // Check if already patched by looking for inlined pattern
  if (content.includes('if (import.meta.hot && typeof window')) {
    console.log(`  ✓ already patched: ${path.basename(filePath)}`)
    return true
  }

  // Step 1: Remove `const hot = import.meta.hot\n` (the declaration + newline)
  // Step 2: Rewrite `if (hot && typeof window !== 'undefined') {` → `if (import.meta.hot && typeof window !== 'undefined') {`
  // Step 3: Replace `hot.data` with `import.meta.hot.data` inside the template body

  let patched = content
  let applied = 0

  // Pattern 1: Remove the standalone declaration line `const hot = import.meta.hot` followed by a newline
  const declPattern = 'const hot = import.meta.hot\n'
  const declIdx = patched.indexOf(declPattern)
  if (declIdx !== -1) {
    patched = patched.slice(0, declIdx) + patched.slice(declIdx + declPattern.length)
    applied++
  }

  // Pattern 2: `if (hot &&` → `if (import.meta.hot &&`
  const ifPattern = 'if (hot &&'
  const ifIdx = patched.indexOf(ifPattern)
  if (ifIdx !== -1) {
    patched =
      patched.slice(0, ifIdx) + 'if (import.meta.hot &&' + patched.slice(ifIdx + ifPattern.length)
    applied++
  }

  // Pattern 3: `hot.data` → `import.meta.hot.data` (the body usage)
  const dataPattern = 'hot.data'
  const dataIdx = patched.indexOf(dataPattern)
  if (dataIdx !== -1) {
    patched =
      patched.slice(0, dataIdx) +
      'import.meta.hot.data' +
      patched.slice(dataIdx + dataPattern.length)
    applied++
  }

  if (applied === 0) {
    console.warn(`  ⚠  no replacement patterns found in: ${path.basename(filePath)}`)
    return false
  }

  fs.writeFileSync(filePath, patched, 'utf8')
  console.log(`  ✓ patched (${applied} replacements): ${path.basename(filePath)}`)
  return true
}

function main() {
  console.log('[@tanstack/router-plugin patch]')

  const pkgRoot = resolvePackageRoot()

  if (!pkgRoot) {
    console.warn(
      '  ⚠  @tanstack/router-plugin not found in node_modules. ' +
        'Skipping — this is expected if dependencies are not yet installed.',
    )
    process.exit(0)
  }

  console.log(`  root: ${pkgRoot}`)

  let patchedAny = false
  for (const rel of RELATIVE_TARGETS) {
    const abs = path.resolve(pkgRoot, rel)
    patchedAny = patchFile(abs) || patchedAny
  }

  if (patchedAny) {
    console.log('  Done. Restart the dev server if it was already running.')
  } else {
    console.log('  Nothing to patch (already up to date or files not found).')
  }
}

main()
