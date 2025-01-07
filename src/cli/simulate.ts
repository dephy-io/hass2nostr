import type { Command } from "commander";
import { resolve } from "@std/path";
import { TextLineStream } from "@std/streams";
import { SimulatedDevice } from "../crypto.ts";
import { getKnownDeviceTypeList, getRandomInt, wait, logger, setVerbose } from "../utils.ts";
import { DeviceTypeImportedModule } from "../device-type.ts";
import { NostrPool } from "../nostr.ts";


export default async function simulate(options: { deviceList: string, relays: string[], interval: number, verbose: boolean }, _command: Command) {
  setVerbose(options.verbose);

  const deviceListPath = resolve(options.deviceList);
  const deviceListFile = await Deno.open(deviceListPath, { read: true });
  const deviceListStream = deviceListFile.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const currentDeviceTypes = await getKnownDeviceTypeList();
  const deviceList: SimulatedDevice[] = [];

  for await (const data of deviceListStream) {
    if (data.length === 0) {
      continue;
    }
    try {
      const device = SimulatedDevice.fromCsvLine(data);
      if (currentDeviceTypes.includes(device.deviceType)) {
        if (deviceList.some(d => d.deviceId === device.deviceId)) {
          logger.warn(`[!!!WARN!!!] Found duplicated device ID ${device.deviceId}`);
        } else {
          deviceList.push(device);
        }
      } else {
        logger.warn(`[!!!WARN!!!] Found unknown device type: ${device.deviceType} with device ${device.deviceId}`);
      }
    } catch (e) {
      logger.error(`Error parsing device: ${data}`, e);
    }
  }
  logger.info(`Loaded ${deviceList.length} devices from ${deviceListPath}`);

  const nostrPool = new NostrPool(options.relays);

  logger.info("Starting device simulation loops...");
  const deviceLoops = deviceList.map(device => deviceLoop(device, options.interval, nostrPool));
  await Promise.all(deviceLoops);
}

async function deviceLoop(device: SimulatedDevice, interval: number, nostrPool: NostrPool) {
  const { simulateHassState, processState } = await import(`../device-types/${device.deviceType}.ts`) as DeviceTypeImportedModule;
  await wait(getRandomInt(-3000, 3000));

  while (true) {
    const hassState = simulateHassState(device);
    const processedState = processState(hassState);

    logger.info(`device ${device.deviceId} got state`);
    try {
      await nostrPool.publish(device.createStateEvent(processedState));
      logger.info(`device ${device.deviceId} published a state`);
    } catch (error) {
      logger.error(`Error publishing state event for device ${device.deviceId}`, error);
    }

    await wait(interval + getRandomInt(-1000, 1000));
  }
}
