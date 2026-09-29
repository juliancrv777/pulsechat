import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  timeout:30_000,
  expect:{timeout:10_000},
  fullyParallel:false,
  retries:1,
  reporter:'line',
  use:{
    baseURL:'http://127.0.0.1:3000',
    trace:'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
