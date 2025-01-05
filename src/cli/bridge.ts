import type { Command } from "commander";
import { unimplemented } from "../utils.ts";

export default async function bridge(options: { device: string, relays: string[], hassApi: string, token: string }, _command: Command) {
  unimplemented();
}
