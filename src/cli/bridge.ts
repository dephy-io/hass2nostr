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
  deviceTypeWhitelist: string[]
}, _command: Command) {
  const interval = options.interval;
  const nostrPool = new NostrPool(options.relays);
  const bridgeDevice = new BridgeDevice(options.secretKey || Deno.env.get("DEPHY_SECRET_KEY") || "");
  const currentDeviceTypes = await getKnownDeviceTypeList();

  const deviceTypeWhitelist = options.deviceTypeWhitelist.map(type => type.trim().toLowerCase());
  const loadedDeviceTypes = deviceTypeWhitelist.length > 0
    ? currentDeviceTypes.filter(deviceType => deviceTypeWhitelist.includes(deviceType))
    : currentDeviceTypes;
  const loadedDeviceTypesModules = await Promise.all(loadedDeviceTypes.map(deviceType => import(`../device-types/${deviceType}.ts`) as unknown as DeviceTypeImportedModule));
  const hassAccessor = new HassAccessor(options.hassApi, options.token || Deno.env.get("DEPHY_HA_TOKEN") || "", loadedDeviceTypesModules);
  console.log("Loaded device types:", loadedDeviceTypes);

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

async function bridgeLoop(device: BridgeDevice, hassAccessor: HassAccessor, nostrPool: NostrPool) {
  const hassStates = await hassAccessor.getStates();
  console.log(`[${Date.now()}] Got ${hassStates.length} states`);

  console.log("hassStates:", hassStates)

  const event = device.createStateEvent(hassStates);
  await nostrPool.publish(event);
  console.log(`[${Date.now()}] Published event to Nostr`);
}
