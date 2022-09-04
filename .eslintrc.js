const OFF = 0;
const WARN = 1;
const ERR = 2;

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    'newline-before-return': [WARN],
    'no-console': WARN,
    'no-shadow': OFF,
    'prettier/prettier': ERR,
    'prefer-destructuring': [
      WARN,
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
    ],
    'import/extensions': [
      WARN,
      'ignorePackages',
      {
        ts: 'never',
      },
    ],

    // TypeScript rules
    '@typescript-eslint/explicit-function-return-type': WARN,
    '@typescript-eslint/no-explicit-any': WARN,
    '@typescript-eslint/no-shadow': WARN,
    '@typescript-eslint/no-unsafe-member-access': OFF,
    '@typescript-eslint/lines-between-class-members': OFF,
    '@typescript-eslint/naming-convention': OFF,
    '@typescript-eslint/no-unsafe-assignment': OFF,
    '@typescript-eslint/no-unsafe-call': OFF,
    '@typescript-eslint/no-non-null-assertion': OFF,
    '@typescript-eslint/no-unused-vars': OFF,
    '@typescript-eslint/no-var-requires': OFF,
    '@typescript-eslint/no-empty-function': OFF,

    // Turned off rules
    'arrow-body-style': OFF,
    'class-methods-use-this': OFF,
    'function-call-argument-newline': OFF,
    'no-prototype-builtins': OFF,
    'import/no-extraneous-dependencies': OFF,
    'import/prefer-default-export': OFF,
    'lines-between-class-members': OFF,
    'max-classes-per-file': OFF,
    'no-case-declarations': OFF,
    'no-nested-ternary': OFF,
    'no-inner-declarations': OFF,
    'no-plusplus': OFF,

    // 'brace-style': 'stroustrup',

    // 'no-param-reassign': OFF,
    // 'no-restricted-syntax': OFF,
    // 'no-underscore-dangle': OFF,
    // 'no-use-before-define': OFF,
    // 'prefer-const': OFF,

    indent: [ERR, 2],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.d.ts', '.ts'],
        paths: ['src'],
      },
    },
  },
};
