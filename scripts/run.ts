import { Plugin, build } from "esbuild";
import { nanoid } from "nanoid";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

main().catch(console.error);

async function main() {
  const engineSourcePath = resolve("runner/engine.ts");
  const runnerSourcePath = resolve("build/demo.js");

  const runnerContent = await readFile(runnerSourcePath, "utf-8");

  const runnerPlugin: Plugin = {
    name: "runner",
    setup(build) {
      build.onResolve({ filter: /^\.\/runner$/ }, (args) => {
        return {
          path: args.path,
          namespace: "runner-ns",
        };
      });

      build.onLoad({ filter: /.*/, namespace: "runner-ns" }, (args) => ({
        contents: runnerContent,
        loader: "js",
      }));
    },
  };

  const res = await build({
    entryPoints: [engineSourcePath],
    format: "esm",
    bundle: true,
    write: false,
    plugins: [runnerPlugin],
  });

  if (res.outputFiles.length !== 1) {
    throw new Error("Expecting single output file");
  }
  const engineContent = res.outputFiles[0].text;

  const folderBase = resolve("temp");
  const folder = resolve(folderBase, nanoid());
  await mkdir(folder, { recursive: true });

  const enginePath = resolve(folder, "engine.mjs");
  await writeFile(enginePath, engineContent);

  console.log(enginePath);

  const nodePath = process.argv[0];

  const permissions = [
    "--experimental-permission",
    `--allow-fs-read=${enginePath}`,
  ];

  const child = spawn("node", [...permissions, enginePath], {
    stdio: "inherit",
  });

  child.on("error", (err) => {
    console.log("------------");
    console.error(err);
    console.log("------------");
  });

  await new Promise((res) => {
    child.on("close", res);
  });

  await rm(folder, { recursive: true });
}
