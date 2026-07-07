import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist", "src-tauri", "node_modules"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				AbortController: "readonly",
				AbortSignal: "readonly",
				ClipboardEvent: "readonly",
				CustomEvent: "readonly",
				HTMLDivElement: "readonly",
				HTMLElement: "readonly",
				HTMLImageElement: "readonly",
				HTMLInputElement: "readonly",
				KeyboardEvent: "readonly",
				MouseEvent: "readonly",
				document: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				window: "readonly",
			},
		},
		plugins: {
			"react-hooks": reactHooks,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"no-empty": "off",
			"no-case-declarations": "off",
			"no-constant-condition": "off",
			"no-control-regex": "off",
			"no-constant-binary-expression": "off",
			"no-prototype-builtins": "off",
			"no-self-assign": "off",
			"no-unsafe-finally": "off",
			"no-useless-assignment": "off",
			"no-useless-catch": "off",
			"no-useless-escape": "off",
			"prefer-const": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"react-hooks/globals": "off",
			"react-hooks/immutability": "off",
			"react-hooks/preserve-manual-memoization": "off",
			"react-hooks/purity": "off",
			"react-hooks/refs": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
);
