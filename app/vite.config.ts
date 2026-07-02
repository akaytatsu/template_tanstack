/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import path from 'path'
import { execSync } from 'node:child_process'

const git = (cmd: string): string => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

const gitSha = process.env.GIT_SHA || git('git rev-parse HEAD')
const shortSha = gitSha ? gitSha.slice(0, 7) : ''
const buildDate = process.env.BUILD_DATE || new Date().toISOString()

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(
      git('git describe --tags --always --dirty') || shortSha || 'dev',
    ),
    __APP_COMMIT__: JSON.stringify(shortSha),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [
    // The TanStack Start / Nitro plugins power dev + build (Nitro emits the
    // deployable Node server at .output/server/index.mjs). Under Vitest they
    // rewrite route files into virtual modules, which breaks unit tests, so we
    // skip them there and rely on the plain React + Testing Library setup.
    ...(process.env.VITEST ? [] : [tanstackStart({ srcDirectory: 'app' }), nitro()]),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Loads @testing-library/jest-dom matchers for every test file.
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'app/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/components/ui/**'],
    },
  },
})
