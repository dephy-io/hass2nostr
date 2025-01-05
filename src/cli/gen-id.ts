import type { Command } from "commander";
import { unimplemented } from "../utils.ts";

export default async function generateNostrIds(options: { quantity: number, output: string }, _command: Command) {
  console.log(options);
  unimplemented();
}
