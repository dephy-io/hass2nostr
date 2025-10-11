// Qingping Air Monitor Lite

import { getRandomInt, now } from "../utils.ts";
import { HassState, TruncatedHassStateWithHash, truncateState } from "../hass.ts";
import { SimulatedDevice } from "../crypto.ts";

export const entityPrefixes = ["sensor.cgllc_cn_584163775_cgd1st_"];

export const allowedEntitySuffixes = [
  "co2_density_p_3_8", //  CO2 density
  "pm2_5_density_p_3_4", //  PM2.5 density
  "pm10_density_p_3_5", //  PM10 density
  "temperature_p_3_7", //  temperature
  "relative_humidity_p_3_1" //  relative_humidity
];

export const allowedAttributes = [
  "state_class",
  "unit_of_measurement",
  "device_class",
  "friendly_name"
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
  const simHumidity = getRandomInt(1, 100);
  const simPM2_5 = getRandomInt(20, 40);
  const simPM10 = getRandomInt(20, 40);
  const simTemperature = getRandomInt(20, 30);
  const simCO2 = getRandomInt(400, 800);
  const nowStr = now();

  return [
    {
      entity_id: `sensor.cgllc_cn_${device.deviceShortId}_cgd1st_relative_humidity_p_3_1`,
      state: simHumidity.toString(),
      attributes: {
        state_class: "measurement",
        unit_of_measurement: "%",
        device_class: "humidity",
        friendly_name: "青萍空气检测仪 Lite  环境参数 相对湿度"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: { id: `${device.deviceId}-tds-in`, parent_id: null, user_id: null }
    }, {
      entity_id: `sensor.cgllc_cn_${device.deviceShortId}_cgd1st_pm2_5_density_p_3_4`,
      state: simPM2_5.toString(),
      attributes: {
        state_class: "measurement",
        unit_of_measurement: "μg/m³",
        device_class: "pm25",
        friendly_name: "青萍空气检测仪 Lite  环境参数 PM2.5"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: { id: `${device.deviceId}-tds-in`, parent_id: null, user_id: null }
    }, {
      entity_id: `sensor.cgllc_cn_${device.deviceShortId}_cgd1st_pm10_density_p_3_5`,
      state: simPM10.toString(),
      attributes: {
        state_class: "measurement",
        unit_of_measurement: "μg/m³",
        device_class: "pm10",
        friendly_name: "青萍空气检测仪 Lite  环境参数 PM10"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: { id: `${device.deviceId}-tds-in`, parent_id: null, user_id: null }
    }, {
      entity_id: `sensor.cgllc_cn_${device.deviceShortId}_cgd1st_temperature_p_3_7`,
      state: simTemperature.toString(),
      attributes: {
        state_class: "measurement",
        unit_of_measurement: "°C",
        device_class: "temperature",
        friendly_name: "青萍空气检测仪 Lite  环境参数 温度"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: { id: `${device.deviceId}-tds-in`, parent_id: null, user_id: null }
    }, {
      entity_id: `sensor.cgllc_cn_${device.deviceShortId}_cgd1st_co2_density_p_3_8`,
      state: simCO2.toString(),
      attributes: {
        unit_of_measurement: "ppm",
        icon: "mdi:blur",
        friendly_name: "青萍空气检测仪 Lite  环境参数 CO2浓度"
      },
      last_changed: nowStr,
      last_reported: nowStr,
      last_updated: nowStr,
      context: { id: `${device.deviceId}-tds-in`, parent_id: null, user_id: null }
    }
  ]
}
