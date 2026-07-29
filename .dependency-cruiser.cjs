/**
 * Dependency architecture rules for vane-bunny (Expo / React Native).
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies should be avoided.',
      from: { path: '^(src|app)' },
      to: { circular: true },
    },
    {
      name: 'no-utils-depending-on-components',
      severity: 'error',
      comment: 'Utility functions in src/utils should not depend on React UI components.',
      from: { path: '^src/utils/' },
      to: { path: '^(src/components|app)' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '\\.(spec|test|d)\\.ts$|assets/',
    },
    tsConfig: {
      fileName: './tsconfig.json',
    },
  },
};
