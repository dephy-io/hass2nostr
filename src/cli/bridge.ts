import type { Command } from "commander";
import { getKnownDeviceTypeList, wait } from "../utils.ts";
import { NostrPool } from "../nostr.ts";
import { DeviceTypeImportedModule } from "../device-type.ts";
import { HassAccessor } from "../hass.ts";
import { BridgeDevice } from "../crypto.ts";

export default async function bridge(options: {
  secretKey: string,
  hassApi: string,
  interval: number,
  relays: string[],
  token: string,
  deviceTypeWhitelist: string[],
  topic?: string,
  mention?: string
}, _command: Command) {
  const interval = options.interval;
  const nostrPool = new NostrPool(options.relays);
  const bridgeDevice = new BridgeDevice(options.secretKey || Deno.env.get("DEPHY_SECRET_KEY") || "");
  const currentDeviceTypes = await getKnownDeviceTypeList();

  const deviceTypeWhitelist = options.deviceTypeWhitelist.map(type => type.trim().toLowerCase());
  const loadedDeviceTypes = deviceTypeWhitelist.length > 0
    ? currentDeviceTypes.filter(deviceType => deviceTypeWhitelist.includes(deviceType))
    : currentDeviceTypes;

  console.log("Loaded device types:", loadedDeviceTypes);

  const loadedDeviceTypesModules = await Promise.all(loadedDeviceTypes.map(deviceType => import(`../device-types/${deviceType}.ts`) as unknown as DeviceTypeImportedModule));
  const hassAccessor = new HassAccessor(options.hassApi, options.token || Deno.env.get("DEPHY_HA_TOKEN") || "", loadedDeviceTypesModules);

  console.log("Starting bridge loop...");
  while (true) {
    try {
      await bridgeLoop(bridgeDevice, hassAccessor, nostrPool);
    } catch (error) {
      console.error("Error in bridge loop", error);
    }
    await wait(interval);
  }
}

async function bridgeLoop(device: BridgeDevice, hassAccessor: HassAccessor, nostrPool: NostrPool, topic?: string, mention?: string) {
  const hassStates = await hassAccessor.getStates();
  // if state not a number, skip
  hassStates.forEach(state => {
    if (isNaN(Number(state.truncatedState.state))) {
      console.log(`${state.truncatedState.entity_id} state is not a number, skipping`);
      return;
    }
  });

  console.log(`[${new Date().toISOString()}] Got ${hassStates.length} states`);

  const event = device.createStateEvent(hassStates, topic, mention);
  try {
    await nostrPool.publish(event);
    console.log(`[${new Date().toISOString()}] Published event to Nostr${topic ? ` (topic: ${topic})` : ""}${mention ? ` (mention: ${mention})` : ""}`);
  } catch (error) {
    console.error("Error publishing state event", error);
  }
}
