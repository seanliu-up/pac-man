import js from '@eslint/js';

export default [
  js.configs.recommended,
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
