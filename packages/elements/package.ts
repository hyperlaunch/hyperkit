import { Glob } from "bun";
import dts from "bun-plugin-dts-auto";

const glob = new Glob("**/*.ts");
const entrypoints = await Array.fromAsync(glob.scan({ cwd: "./src" }));

const packageJson = await Bun.file("package.json").json();
const packageDist = {
	...packageJson,
	type: "module",
	files: ["dist/**/*"],
	exports: entrypoints.reduce<
		Record<string, { require: string; import: string; types: string }>
	>((acc, file) => {
		const fileName = file.replace(/\.ts$/, "");
		acc[`./${fileName}`] = {
			require: `./dist/${fileName}.js`,
			import: `./dist/${fileName}.js`,
			types: `./dist/${fileName}.d.ts`,
		};
		return acc;
	}, {}),
};

await Bun.write("package/package.json", JSON.stringify(packageDist, null, 2));

await Bun.write("package/README.md", Bun.file("README.md"));

await Bun.build({
	root: "./src",
	entrypoints: entrypoints.map((file) => `./src/${file}`),
	outdir: "./package/dist",
	plugins: [dts({ outdir: "./package/dist" })],
	minify: true, // Minify the JavaScript output
});
