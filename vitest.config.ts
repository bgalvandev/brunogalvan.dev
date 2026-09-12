import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/i18n/**/*.ts'],
      exclude: ['src/**/*.spec.ts'],
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});
