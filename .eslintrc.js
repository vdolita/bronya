const config = {
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  root:true,
  ignorePatterns: ["node_modules/*", ".next/*", ".eslintrc.js", "sdui/*", "*.test.ts"],
  rules:{
  }
};

module.exports = config;