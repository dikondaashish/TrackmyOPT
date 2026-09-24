import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'documents.spec.ts',
  webServer: undefined,
  workers: 1,
});
