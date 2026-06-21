import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
  js.configs.recommended,

  {
    files: [
      "server.js",
  "config/**/*.js",
  "middleware/**/*.js",
  "models/**/*.js",
  "routes/**/*.js",
  "services/**/*.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["static/scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        List: "readonly",
      },
    },
  },

  {
    rules: {
      semi: ["error", "always"],
      camelcase: "error",
    },
  },
]);