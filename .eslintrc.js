const config = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "next/core-web-vitals",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  root:true,
  ignorePatterns: ["node_modules/*", ".next/*", ".eslintrc.js", "sdui/*"],
  rules:{
  }
};

module.exports = config;