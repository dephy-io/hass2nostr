# hass2nostr

## Requirements
- Deno Version >= 2.1.4

## Usage

```bash
  # Install dependencies
  deno install

  # Generate 10 simulated device IDs
  deno task run gen-sim-id -q 10

  # Simulate devices
  deno task run simulate

  # Simulate devices (Verbose Mode)
  deno task run simulate -v

  # Bridge real data
  deno task run bridge -r wss://canary-relay.dephy.dev -w qingping_air_monitor -o qingping_air_monitor --mention 79136d62dd58d589891ce4170851bbdcd25ace722ef9887694ec628fcee3d780
```

## Device Types

Device type modulesare located in the `src/device-types` directory.

Check out `src/device-type.ts` for type definitions of device type modules:
- `processState`: A function that processes the state from Home Assistant.
- `truncateAttributes`: A function that truncates the attributes for Nostr.
- `allowedAttributes`: An array of allowed state attributes.
- `simulateHassState`: A function that simulates the state from Home Assistant.

Check out `src/device-types/chunmi_tsa1.ts` for an example.

## Nostr event

Make changes to `createStateEvent` function in `src/nostr.ts` to customize the Nostr event.