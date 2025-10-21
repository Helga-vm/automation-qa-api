import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: {
      js
    },
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: globals.browser 
    },
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "warn",
            "no-unused-expressions": "warn",
            "no-setter-return":"error",
            "camelcase":"warn",
            "curly":"warn",
            "eqeqeq":"warn", // only strict === or !==
            "no-unneeded-ternary": "warn",
            "no-var":"error", // require let or const instead of var
            "semi":"error",
            "prefer-const":"error"
		},
    ignores: ["node_modules/"]
	}
]);