import functional from 'eslint-plugin-functional';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/explorer-old',
      '!**/.storybook',
      'src/api-client/graphql.tsx',
      'src/api-client/page.tsx',
      'src/api/db',
      'src/@types/resolvers-types.ts',
    ],
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'next',
  ),
  {
    plugins: {
      functional,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'react/prop-types': 0,
      'react/no-unescaped-entities': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/triple-slash-reference': 0,
      'functional/no-let': 0,
      'functional/prefer-readonly-type': 0,
      'functional/no-method-signature': 0,
      'no-var': 'error',
      'no-param-reassign': 'error',
      'prefer-const': 'error',

      'jsx-a11y/label-has-associated-control': [
        2,
        {
          controlComponents: ['TextArea'],
        },
      ],
    },
  },
];
