// Minimal ESLint config that enforces ONLY react-hooks/rules-of-hooks.
//
// The full `eslint.config.js` currently surfaces hundreds of pre-existing
// style/type errors, so it can't be used as a merge gate today. This config
// parses TS/TSX but enables a single rule, so CI (and an optional pre-commit
// hook) can block Rules-of-Hooks violations — the class of bug behind
// React error #310 ("Rendered more hooks than during the previous render") —
// without being drowned out by unrelated lint noise.
//
// Run with: npm run lint:hooks
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    // Don't flag the repo's existing `eslint-disable` comments (for rules this
    // slim config doesn't enable) as "unused".
    linterOptions: { reportUnusedDisableDirectives: false },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // react-hooks supplies the one rule we enforce; @typescript-eslint is
    // registered only so inline disable comments referencing its rules resolve
    // (its rules stay off).
    plugins: { 'react-hooks': reactHooks, '@typescript-eslint': tseslint.plugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
