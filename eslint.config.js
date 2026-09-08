// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // Docs holds documentation tooling, not app code — the screenshot script pulls in
    // playwright, which is deliberately not a dependency of the app.
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'Docs/**'],
  },
]);
