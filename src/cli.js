// commander.js has wrong type definitions for command options
// so we don't use TypeScript here

import { Command } from "commander";

export async function run() {
  const program = new Command();

  program
    .name("hass2nostr")
    .version("0.0.1");

  program.command("gen-sim-id")
    .description("Generate simulated device identities")
    .option("-q, --quantity <quantity>", "Quantity of device identities to generate", 1, parseInt)
    .option("-o, --output <output>", "Output file", "./sim-ids.csv")
    .option("-a, --append", "Append to existing file", false)
    .action(lazyImportAction("./cli/gen-sim-device-id.ts"));

  program.command("simulate")
    .description("Start simulation of sending events from Home Assistant to Nostr")
    .option("-l, --device-list <id-list>", "List of Nostr IDs", "./sim-ids.csv")
    .option("-i, --interval <interval>", "Interval between events", 10000, parseInt)
    .option("-r, --relays <relays...>", "Nostr relays", ["https://nostream.dephy.dev/"])
    .option("-v, --verbose", "Verbose mode", false)
    .action(lazyImportAction("./cli/simulate.ts"));

  program.command("bridge")
    .description("Bridge Home Assistant states to Nostr")
    .option("-a, --hass-api <hass-api>", "Home Assistant API URL", "http://homeassistant.local:8123")
    .option("-t, --token <token>", "Home Assistant API token (if not set, will read from environment variable `DEPHY_HA_TOKEN`)", "")
    .option("-r, --relays <relays...>", "Nostr relays", ["https://nostream.dephy.dev/"])
    .action(lazyImportAction("./cli/bridge.ts"));

  await program.parseAsync();
}

function lazyImportAction(path) {
  return async (...args) => {
    const { default: action } = await import(path);
    await action(...args);
  };
}
