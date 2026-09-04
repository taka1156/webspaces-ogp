import { defineConfig } from "vite";

export default defineConfig({
	root: ".",
	build: {
		outDir: "./src/backend/assets/lib",
		emptyOutDir: true,
		lib: {
			entry: "src/components/OGPCard/index.ts",
			name: "OgpCard",
			fileName: (format) => `ogp-card.${format}.js`,
			formats: ["es", "umd"],
		},
		cssCodeSplit: false,
	},
	esbuild: {
		target: "es2022",
	},
});
