import { FlatCompat } from '@eslint/eslintrc';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url))
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: { perfectionist: perfectionistPlugin },
    rules: {
      'perfectionist/sort-exports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-imports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }]
    }
  }
];

export default eslintConfig;
