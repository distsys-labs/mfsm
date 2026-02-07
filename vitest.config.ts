import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['spec/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/index.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'tests/**', 'src/declarations.d.ts', 'src/types.ts'],
      all: true,
      clean: true,
      reportOnFailure: true
    }
  }
})
