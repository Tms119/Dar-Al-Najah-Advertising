import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true, varsIgnorePattern: '^_' }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'convex/_generated/**', 'next-env.d.ts']),
]);
