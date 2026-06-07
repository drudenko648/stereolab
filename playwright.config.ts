import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// On hosts without root, Chromium's system libs (libnspr4/libnss3/libasound2)
// can be unpacked into .pw-deps (see DEPENDENCIES.md). If that folder exists,
// add it to LD_LIBRARY_PATH so the spawned browser can find them. No-op on
// machines where the libs are installed system-wide (e.g. CI with --with-deps).
const localLibDir = fileURLToPath(
  new URL('.pw-deps/root/usr/lib/x86_64-linux-gnu', import.meta.url),
)
if (existsSync(localLibDir)) {
  process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
    ? `${localLibDir}:${process.env.LD_LIBRARY_PATH}`
    : localLibDir
}

// E2E + visual tests run the real app in Chromium with WebGL. The web server
// builds the app and serves the production preview so rendering is stable.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Allow software WebGL (SwiftShader) in headless/CI environments.
          args: ['--enable-unsafe-swiftshader'],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
