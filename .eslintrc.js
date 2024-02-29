module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "tsconfig.json",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint/eslint-plugin", "react", "jsx-a11y"],
    extends: ["plugin:@next/next/recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    root: true,
    env: {
      es6: true,
      node: true,
      jest: true,
    },
    globals: {
      NodeJS: true,
      document: true,
      MediaRecorder: true,
      window: true,
      navigator: true,
    },
    ignorePatterns: [".eslintrc.js", "socket.io-promise.js", "next.config.js"],
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": ["error"],
    },
  };