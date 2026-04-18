import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['src/game/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['*/rendering/*', '../rendering/*', '../../rendering/*'], message: 'src/game must not import from src/rendering' },
          { group: ['*/input/*', '../input/*', '../../input/*'], message: 'src/game must not import from src/input' },
          { group: ['*/audio/*', '../audio/*', '../../audio/*'], message: 'src/game must not import from src/audio' },
          { group: ['*/storage/*', '../storage/*', '../../storage/*'], message: 'src/game must not import from src/storage' },
        ],
      }],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
];
