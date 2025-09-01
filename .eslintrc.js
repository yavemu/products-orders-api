module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**/*', 'uploads/**/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'prettier/prettier': ['error', {
      'singleQuote': true,
      'trailingComma': 'all',
      'printWidth': 100,
      'tabWidth': 2,
      'semi': true
    }]
  },
  overrides: [
    {
      files: [
        'src/common/utils/**/*.ts',
        'src/common/interfaces/**/*.ts',
        'src/common/dto/**/*.ts',
        'src/common/decorators/**/*.ts',
        'src/common/interceptors/**/*.ts',
        'src/**/*.dto.ts',
        'src/**/repository/**/*.ts'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
};