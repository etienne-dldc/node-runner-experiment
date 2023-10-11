import { build } from "esbuild";
import { resolve } from "node:path";

main().catch(console.error);

async function main() {
  const entry = resolve("examples/demo.ts");
  const outdir = resolve("build");

  await build({
    entryPoints: [entry],
    outdir,
    format: "esm",
  });
}
