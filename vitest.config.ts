import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: [
      'packages/**/*.{test,spec}.ts',
      'packages/**/__tests__/**/*.ts',
      'playground/**/*.{test,spec}.ts',
      'scripts/dev/**/*.{test,spec}.mjs'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
