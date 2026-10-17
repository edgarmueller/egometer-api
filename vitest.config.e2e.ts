import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // the suites share one database
    fileParallelism: false,
    env: {
      // a database of its own, which the tests wipe
      MONGODB_URI:
        process.env.MONGODB_URI_E2E ?? 'mongodb://localhost:27017/egometer-e2e',
    },
  },
});
