import { defineConfig, devices } from '@playwright/test';

// E2E runs against a production build served by `vite preview`.
// The build uses dummy Supabase credentials (see e2e/README.md), so all
// flows exercised here are client-side only and cannot touch live data.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      // iPhone 13's device descriptor defaults to WebKit, which is not
      // installed; run the same viewport/UA emulation in Chromium instead.
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
