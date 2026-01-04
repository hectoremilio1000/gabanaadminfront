import { defineConfig, devices } from "@playwright/test";

const FRONT_URL = process.env.FRONT_URL || "http://127.0.0.1:4173";
const shouldStartServer = !process.env.FRONT_URL;
const slowMo = Number(process.env.PW_SLOWMO || "0") || 0;

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  expect: {
    timeout: 7_500,
  },
  reporter: "list",
  use: {
    baseURL: FRONT_URL,
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: FRONT_URL,
        launchOptions: slowMo ? { slowMo } : undefined,
      },
    },
  ],
  webServer: shouldStartServer
    ? {
        command: "npm run dev -- --host 127.0.0.1 --port 4173",
        url: FRONT_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          ...process.env,
          VITE_USE_MOCK_MAPS: "1",
        },
      }
    : undefined,
});
