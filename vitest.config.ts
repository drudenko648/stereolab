import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest runs the pure geometry units and the React component/store tests.
// WebGL cannot run here, so the 3D scene is covered by Playwright instead.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    // CSS (Tailwind) is irrelevant to logic tests; skip processing it.
    css: false,
  },
})
