import { DateTime } from 'luxon';

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function now() {
  return DateTime.utc().toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZ");
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function unimplemented() {
  throw new Error("Not implemented");
}

export async function getKnownDeviceTypeList() {
  const devices = [];
  for await (const entry of Deno.readDir("./src/device-types")) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      devices.push(entry.name.replace(/\.ts$/, ""));
    }
  }
  return devices;
}
