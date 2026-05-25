import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Tenant Theme Editor micro-frontend E2E tests.
 *
 * The editor runs on port 4446 in dev mode (via `npm run dev` or Tilt).
 * These tests target the standalone editor UI, not the BaseClient shell.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: '../reports/e2e-html' }], ['list']],

  use: {
    baseURL: process.env.EDITOR_URL || 'http://localhost:4446',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  timeout: 30000,
  expect: { timeout: 5000 },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
