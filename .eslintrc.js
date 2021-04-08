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
    "plugin:@typescript-eslint/recommended",  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:prettier/recommended",            // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    "prefer-destructuring": "warn",
    "class-methods-use-this": "off",
    "global-require": "off",
    "func-names": "off",
    "import/prefer-default-export": "off",
    "no-magic-numbers": ["off"],
    "no-console": "off",
  },
};