import { runner } from "./runner";

run();

async function run() {
  console.log();

  await runner({ todo: true });
}
