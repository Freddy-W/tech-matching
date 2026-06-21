import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
  js.configs.recommended,

  {
    // zodat eslint weet dat het om een node project gaat en dus require werkt
    files: ["server.js"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    // zodat eslint weet dat het om een browser project gaat en dus document werkt
    files: ["static/scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        List: "readonly" // zodat eslint weet dat List een globale variabele is
      }
    },
  },

  {
    rules: {
      "semi": ["error", "always"],
      "camelcase": "error",
    },
  },
]);