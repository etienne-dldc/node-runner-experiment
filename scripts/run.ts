import { build } from "esbuild";
import { nanoid } from "nanoid";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

main().catch(console.error);

async function main() {
  const engineSourcePath = resolve("runner/engine.ts");
  const runnerSourcePath = resolve("build/demo.js");

  const runnerContent = await readFile(runnerSourcePath, "utf-8");

  const res = await build({
    entryPoints: [engineSourcePath],
    format: "esm",
    write: false,
  });
  if (res.outputFiles.length !== 1) {
    throw new Error("Expecting single output file");
  }
  const engineContent = res.outputFiles[0].text;

  const folderBase = tmpdir();
  const folder = resolve(folderBase, nanoid());
  await mkdir(folder);
  const enginePath = resolve(folder, "engine.mjs");
  const runnerPath = resolve(folder, "runner.mjs");
  await writeFile(enginePath, engineContent);
  await writeFile(runnerPath, runnerContent);

  const nodePath = process.argv[0];

  console.log(folder);

  const child = spawn(`node`, [enginePath], {
    env: { RUNNER_FILE: "./runner.mts" },
  });

  child.on("error", (err) => {
    console.error(err);
  });

  await new Promise((res) => {
    child.on("close", res);
  });

  // await rm(folder, { recursive: true });
}
