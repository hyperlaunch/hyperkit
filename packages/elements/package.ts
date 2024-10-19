import { Glob } from "bun";
import dts from "bun-plugin-dts-auto";

const packageJson = await Bun.file("package.json").json();
const packageDist = {
	...packageJson,
	exports: {
		"./*": "./dist/*",
		"./package.json": "./package.json",
	},
	typings: "./dist/index.d.ts",
	type: "module",
	files: ["dist/**/*"],
};
await Bun.write("package/package.json", JSON.stringify(packageDist));

await Bun.write("package/README.md", Bun.file("README.md"));

const glob = new Glob("**/*.ts");
const entrypoints = await Array.fromAsync(glob.scan({ cwd: "./src" }));

await Bun.build({
	root: "./src",
	entrypoints: entrypoints.map((file) => `./src/${file}`),
	outdir: "./package/dist",
	plugins: [dts({ outdir: "./package/dist" })],
	minify: true,
});
