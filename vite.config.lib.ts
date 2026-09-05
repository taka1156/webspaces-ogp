import minifyHTML from "@lit-labs/rollup-plugin-minify-html-literals";
import { transform } from "esbuild";
import { defineConfig } from "vite";

export default defineConfig({
	root: ".",
	build: {
		outDir: "./assets/lib",
		emptyOutDir: true,
		minify: true,
		cssCodeSplit: false,
		lib: {
			entry: "src/components/OGPCard/index.ts",
			name: "OgpCard",
			fileName: (format) => `ogp-card.${format}.js`,
			formats: ["es", "umd"],
		},
	},
	plugins: [
		minifyHTML(),
		{
			name: "minify-whitespace-only",
			enforce: "post",
			async generateBundle(_, bundle) {
				for (const chunk of Object.values(bundle)) {
					if (chunk.type === "chunk") {
						const result = await transform(chunk.code, {
							minifyWhitespace: true,
							loader: "js",
						});
						chunk.code = result.code;
					}
				}
			},
		},
	],
});
