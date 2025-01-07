import type { Command } from "commander";
import { exists } from "@std/fs";
import { resolve } from "@std/path";
import { getKnownDeviceTypeList, randomDeviceType } from "../utils.ts";
import { SimulatedDevice } from "../crypto.ts";

export default async function generateNostrIds(options: { quantity: number, output: string, append: boolean }, _command: Command) {
  const outputPath = resolve(options.output);
  const outputFileExists = await exists(outputPath);

  if (!options.append) {
    if (outputFileExists) {
      throw new Error(`Output file ${outputPath} already exists`);
    }
  }

  const encoder = new TextEncoder();
  const deviceTypeList = await getKnownDeviceTypeList();

  const file = Deno.openSync(outputPath, { create: true, write: true, append: options.append });
  const fileWriter = file.writable.getWriter();
  await fileWriter.ready;


  if (outputFileExists) {
    fileWriter.write(encoder.encode("\n"));
  }

  for (let i = 0; i < options.quantity; i++) {
    const deviceType = randomDeviceType(deviceTypeList);
    const device = SimulatedDevice.generateDevice(deviceType);
    const encoded = device.toCsvLine() + "\n";
    await fileWriter.write(encoder.encode(encoded));
  }
  await fileWriter.close();
  console.log(`Generated ${options.quantity} simulated IDs to ${outputPath}`);
}
