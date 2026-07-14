import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/*/src/**/*.spec.ts", "tests/**/*.spec.ts"],
		globals: true,
		root: "./",
		mockReset: false,
		exclude: ["**/node_modules/**", "**/dist/**"],
		environment: "node",
		coverage: {
			reporter: ["html"],
			provider: "v8",
			exclude: ["**/node_modules/**", "**/dist/**"],
			include: ["packages/*/src/**/*.ts"],
		},
	},
	plugins: [],
});
