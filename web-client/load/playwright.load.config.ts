import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost'

export default defineConfig({
  testDir: './',
  testMatch: 'under-load.spec.ts',
  timeout: 120_000,
  workers: 3,
  fullyParallel: true,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-load-report' }], ['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
