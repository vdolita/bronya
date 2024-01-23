const config = {
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  root:true,
  ignorePatterns: ["node_modules/*", ".next/*", ".eslintrc.js", "next.config.mjs","sdui/*", "*.test.ts"],
  rules:{
  }
};

module.exports = config;