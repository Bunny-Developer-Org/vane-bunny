// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  // Runs Prettier as an ESLint rule and disables ESLint's own stylistic
  // rules, so `npm run lint` is the one command that enforces both.
  prettierRecommended,
  {
    ignores: ['dist/*'],
  },
]);
