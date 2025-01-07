import { HassState, TruncatedHassStateWithHash } from "./hass.ts";
import { SimulatedDevice } from "./crypto.ts";

export type AllowedAttributeArray = string[];
export type TruncateAttributesFn = (attributes: Record<string, unknown>) => Record<string, unknown>;
export type ProcessStateFn = (hassState: HassState[]) => TruncatedHassStateWithHash[];
export type SimulateHassStateFn = (device: SimulatedDevice) => HassState[];

export type DeviceTypeImportedModule = {
  allowedAttributes: AllowedAttributeArray;
  truncateAttributes: TruncateAttributesFn;
  processState: ProcessStateFn;
  simulateHassState: SimulateHassStateFn;
};
