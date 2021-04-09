module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript',
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prefer-destructuring": "warn",
    "class-methods-use-this": "off",
    "global-require": "off",
    "func-names": "off",
    "import/prefer-default-export": "off",
    "no-magic-numbers": ["off"],
    "no-console": "off",
    "quotes": ["warn", "double"],
  },
};