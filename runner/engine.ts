import initSqlJs from "sql.js";
import { runner } from "./runner";

run();

async function run() {
  console.log();
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const res = db.exec("SELECT 1");
  console.log("-----------------");
  console.log({ res });
  console.log("-----------------");

  await runner({ todo: true });
}
