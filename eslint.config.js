
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'react/display-name': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]);
