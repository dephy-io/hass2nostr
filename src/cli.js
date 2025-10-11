// commander.js has wrong type definitions for command options
// so we don't use TypeScript here

import { Command } from "commander";

export async function run() {
  const program = new Command();

  program
    .name("hass2nostr")
    .version("0.0.1");

  program.command("simulate")
    .description("Start simulation of sending events from Home Assistant to Nostr")
    .option("-s, --secret-key <secret-key>", "DID Secret key in hex format (if not set, will read from environment variable `DEPHY_SECRET_KEY`)", "")
    .option("-i, --interval <interval>", "Interval between events", 10000, parseInt)
    .option("-r, --relays <relays...>", "Nostr relays", ["wss://dev-relay.dephy.dev"])
    .option("-w, --device-type-whitelist <devType...>", "Device types to simulate (Empty for all known types)", [])
    .option("-o, --topic <topic>", "Topic name to publish simulated events to")
    .option("-m, --mention <mention>", "Controller pubkey to mention in simulated events")
    .action(lazyImportAction("./cli/simulate.ts"));

  program.command("bridge")
    .description("Bridge Home Assistant states to Nostr")
    .option("-s, --secret-key <secret-key>", "DID Secret key in hex format(if not set, will read from environment variable `DEPHY_SECRET_KEY`)", "")
    .option("-a, --hass-api <hass-api>", "Home Assistant API URL", "http://localhost:8123")
    .option("-i, --interval <interval>", "Interval between events", 10000, parseInt)
    .option("-t, --token <token>", "Home Assistant API token (if not set, will read from environment variable `DEPHY_HA_TOKEN`)", "")
    .option("-r, --relays <relays...>", "Nostr relays", ["wss://dev-relay.dephy.dev"])
    .option("-w, --device-type-whitelist <devType...>", "Device types to bridge(Empty for all known types)", [])
    .option("-o, --topic <topic>", "Relay topic stream")
    .option("-m, --mention <mention>", "Controller pubkey")
    .action(lazyImportAction("./cli/bridge.ts"));

  await program.parseAsync();
}

function lazyImportAction(path) {
  return async (...args) => {
    const { default: action } = await import(path);
    await action(...args);
  };
}
