import type { Command } from "commander";
// ...existing code...
import { SimulatedDevice } from "../crypto.ts";
import { getKnownDeviceTypeList, getRandomInt, wait } from "../utils.ts";
import { DeviceTypeImportedModule } from "../device-type.ts";
import { NostrPool } from "../nostr.ts";


export default async function simulate(options: { secretKey?: string, relays: string[], interval: number, verbose: boolean, deviceTypeWhitelist: string[], topic?: string, mention?: string }, _command: Command) {
  const interval = options.interval;
  const nostrPool = new NostrPool(options.relays);
  const secretKey = options.secretKey || Deno.env.get("DEPHY_SECRET_KEY") || "";
  if (!secretKey) throw new Error("Secret key is required (pass -s or set DEPHY_SECRET_KEY)");

  const currentDeviceTypes = await getKnownDeviceTypeList();

  const deviceTypeWhitelist = options.deviceTypeWhitelist.map(type => type.trim().toLowerCase());
  const loadedDeviceTypes = deviceTypeWhitelist.length > 0
    ? currentDeviceTypes.filter(deviceType => deviceTypeWhitelist.includes(deviceType))
    : currentDeviceTypes;

  console.log("Loaded device types:", loadedDeviceTypes);

  await Promise.all(loadedDeviceTypes.map(deviceType => import(`../device-types/${deviceType}.ts`) as unknown as DeviceTypeImportedModule));

  console.log("Starting simulation loops...");
  const deviceLoops = loadedDeviceTypes.map(deviceType => {
    const device = new SimulatedDevice(secretKey, deviceType);
    return deviceLoop(device, interval, nostrPool, options.topic, options.mention);
  });
  await Promise.all(deviceLoops);
}

async function deviceLoop(device: SimulatedDevice, interval: number, nostrPool: NostrPool, topic?: string, mention?: string) {
  const { simulateHassState, processState } = await import(`../device-types/${device.deviceType}.ts`) as DeviceTypeImportedModule;
  await wait(getRandomInt(0, 30000));

  while (true) {
    const hassStates = simulateHassState(device);
    const processedState = processState(hassStates);

    console.log(`[${new Date().toISOString()}] Got ${hassStates.length} states from ${device.deviceType}`);

    try {
      await nostrPool.publish(device.createStateEvent(processedState, topic, mention));
      console.log(`[${new Date().toISOString()}] Published event to Nostr${topic ? ` (topic: ${topic})` : ""}${mention ? ` (mention: ${mention})` : ""}`);

    } catch (error) {
      console.error(`Error publishing state event`, error);
    }

    await wait(interval + getRandomInt(-1000, 1000));
  }
}
