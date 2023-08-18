module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        groups: ['type', 'builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        'newlines-between': 'never'
      }
    ],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/prefer-default-export': 'off',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }]
  }
};
