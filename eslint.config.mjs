import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import perfectionistPlugin from 'eslint-plugin-perfectionist';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      'out/**',
      '.next/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**'
    ],
    plugins: { perfectionist: perfectionistPlugin },
    rules: {
      'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-exports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-imports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          order: 'asc',
          type: 'natural'
        }
      ],
      'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }]
    }
  }
];

export default eslintConfig;
