module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    sourceType: "script", // Use "script" for CommonJS
    ecmaVersion: 12,
  },
  rules: {
    // Add any custom rules if needed
    "no-console": "off", // Allow console.log for debugging
  },
};
