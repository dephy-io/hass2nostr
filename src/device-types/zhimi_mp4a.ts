// Xiaomi Smart Air Purifier 4

import { getRandomInt, now } from "../utils.ts";
import { HassState, TruncatedHassStateWithHash, truncateState } from "../hass.ts";
import { SimulatedDevice } from "../crypto.ts";

export const entityPrefix = "sensor.zhimi_mp4a_";

export const allowedEntitySuffixes = [
  "temperature",
  "relative_humidity"
];

export const allowedAttributes = [
  "state_class",
  "unit_of_measurement",
  "environment.relative_humidity",
  "environment.temperature"
];

export function truncateAttributes(attributes: Record<string, unknown>): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const key in attributes) {
    if (allowedAttributes.includes(key)) {
      ret[key] = attributes[key];
    }
  }
  return ret;
}

export function processState(hassState: HassState[]): TruncatedHassStateWithHash[] {
  return hassState.map(s => truncateState(s, truncateAttributes));
}

export function simulateHassState(device: SimulatedDevice): HassState[] {
  const tdsIn = getRandomInt(300, 450);
  const tdsOut = getRandomInt(1, 100);
  const nowStr = now();

  return [{
    "entity_id": `sensor.chunmi_tsa1_${device.deviceShortId}_total_dissolved_solids_for_input_water`,
    "state": tdsIn.toString(),
    "attributes": {
      "state_class": "measurement",
      "tds_sensor.tds_in": tdsIn,
      "unit_of_measurement": "ppm",
      "icon": "mdi:water",
      "friendly_name": "小米台式净饮机 2 入水水质"
    },
    "last_changed": nowStr,
    "last_reported": nowStr,
    "last_updated": nowStr,
    "context": {
      "id": `${device.deviceId}-tds-in`,
      "parent_id": null,
      "user_id": null
    }
  },
  {
    "entity_id": `sensor.chunmi_tsa1_${device.deviceShortId}_total_dissolved_solids_for_output_water`,
    "state": tdsOut.toString(),
    "attributes": {
      "state_class": "measurement",
      "tds_sensor.tds_out": tdsOut,
      "unit_of_measurement": "ppm",
      "icon": "mdi:water-check",
      "friendly_name": "小米台式净饮机 2 出水水质"
    },
    "last_changed": nowStr,
    "last_reported": nowStr,
    "last_updated": nowStr,
    "context": {
      "id": `${device.deviceId}-tds-out`,
      "parent_id": null,
      "user_id": null
    }
  }]
}
