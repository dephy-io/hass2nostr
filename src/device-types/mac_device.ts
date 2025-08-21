// mac_device.ts

import { now } from "../utils.ts";
import { HassState, TruncatedHassStateWithHash, truncateState } from "../hass.ts";
import { SimulatedDevice } from "../crypto.ts";

/**
 * 前缀：只匹配 mac 设备相关实体
 */
export const entityPrefixes = ["sensor.mac_"];

/**
 * 后缀：你想关注的属性，可以是空数组表示只按前缀匹配
 */
export const allowedEntitySuffixes = [
  "geocoded_location",
  "active_camera",
  "active_audio_input"
];

/**
 * 需要保留的属性
 */
export const allowedAttributes = [
  "icon",
  "friendly_name",
  "state_class",
  "unit_of_measurement"
];

/**
 * 截断属性
 */
export function truncateAttributes(attributes: Record<string, unknown>): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const key in attributes) {
    if (allowedAttributes.includes(key)) {
      ret[key] = attributes[key];
    }
  }
  return ret;
}

/**
 * 将 HassState 截断为 TruncatedHassStateWithHash
 */
export function processState(hassState: HassState[]): TruncatedHassStateWithHash[] {
  return hassState.map(s => truncateState(s, truncateAttributes));
}

/**
 * 生成模拟 mac 设备状态
 */
export function simulateHassState(device: SimulatedDevice): HassState[] {
  const nowStr = now();

  return [
    {
      entity_id: `sensor.mac_${device.deviceShortId}_geocoded_location`,
      state: "unavailable",
      attributes: {
        icon: "mdi:dots-square",
        friendly_name: "Mac Geocoded Location"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: {
        id: `${device.deviceId}-location`,
        parent_id: null,
        user_id: null
      }
    },
    {
      entity_id: `sensor.mac_${device.deviceShortId}_active_camera`,
      state: "unavailable",
      attributes: {
        icon: "mdi:camera",
        friendly_name: "Mac Active Camera"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: {
        id: `${device.deviceId}-camera`,
        parent_id: null,
        user_id: null
      }
    },
    {
      entity_id: `sensor.mac_${device.deviceShortId}_active_audio_input`,
      state: "unavailable",
      attributes: {
        icon: "mdi:microphone",
        friendly_name: "Mac Active Audio Input"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: {
        id: `${device.deviceId}-audio`,
        parent_id: null,
        user_id: null
      }
    }
  ];
}
