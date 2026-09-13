import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list']]
    : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      // Only what a viewport can change: rendered accessibility and overflow.
      // Metadata, links and the theme script do not vary with the screen size.
      name: 'mobile',
      testMatch: '**/foundation.spec.ts',
      grep: /accessible .* page without overflow/,
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm run build && node scripts/e2e/preview.mjs',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
});
