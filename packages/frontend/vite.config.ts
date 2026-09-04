import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig({
	root: ".",
	server: {
		host: "0.0.0.0",
		port: 8080,
		open: true,
		fs: {
			strict: false,
		},
	},
	build: {
		target: "es2022",
	},
	esbuild: {
		target: "es2022",
	},
});
