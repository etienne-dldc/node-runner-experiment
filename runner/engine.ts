import { RunnerModule } from "./types";

run();

async function run() {
  const file = process.env.RUNNER_FILE;
  if (!file) {
    throw new Error("No RUNNER_FILE env");
  }
  const mod: RunnerModule = await import(file);
  await mod.runner({ todo: true });
}
