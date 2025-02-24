import { generateSecretKey, getPublicKey } from '@nostr/tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { TruncatedHassStateWithHash } from "./hass.ts";
import { createStateEvent } from "./nostr.ts";

export class BridgeDevice {
  secretKey: Uint8Array;
  pubkeyHex: string;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Secret key is required");
    }
    this.secretKey = hexToBytes(secretKey);
    this.pubkeyHex = getPublicKey(this.secretKey);
  }

  createStateEvent(state: TruncatedHassStateWithHash[]) {
    return createStateEvent(state, this.secretKey);
  }
}

export class SimulatedDevice {
  secretKey: Uint8Array;
  pubkeyHex: string;
  deviceId: string;
  deviceShortId: string;
  deviceType: string;

  static generateDevice(deviceType: string) {
    const secretKey = generateSecretKey();
    return new SimulatedDevice(secretKey, deviceType);
  }

  static fromCsvLine(line: string) {
    const [secretKeyHex, deviceType] = line.split(',');
    if (!secretKeyHex || !deviceType) {
      throw new Error("Invalid CSV line format");
    }
    const secretKey = hexToBytes(secretKeyHex);
    return new SimulatedDevice(secretKey, deviceType);
  }

  constructor(secretKey: Uint8Array, deviceType: string) {
    this.secretKey = secretKey;
    this.pubkeyHex = getPublicKey(secretKey);
    this.deviceId = this.pubkeyHex;
    this.deviceShortId = this.pubkeyHex.slice(0, 4);
    this.deviceType = deviceType;
  }

  createStateEvent(state: TruncatedHassStateWithHash[]) {
    return createStateEvent(state, this.secretKey);
  }

  toCsvLine() {
    return `${bytesToHex(this.secretKey)},${this.deviceType}`;
  }
}
