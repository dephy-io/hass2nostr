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

export function randomDeviceType(deviceTypeList: string[]) {
  return deviceTypeList[getRandomInt(0, deviceTypeList.length - 1)];
}

export const VERBOSE_LOGGER: Logger = { info: console.log, warn: console.warn, error: console.error };
export const QUIET_LOGGER: Logger = { info: () => { }, warn: console.warn, error: console.error };

export type Logger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export let logger: Logger = QUIET_LOGGER;
export function setVerbose(verbose: boolean) {
  logger = verbose ? VERBOSE_LOGGER : QUIET_LOGGER;
}
