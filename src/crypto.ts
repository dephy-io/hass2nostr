import { getPublicKey } from '@nostr/tools/pure'
import { hexToBytes } from '@noble/hashes/utils'
import { TruncatedHassStateWithHash } from "./hass.ts";
import { createStateEvent } from "./nostr.ts";

export class BridgeDevice {
  secretKey: Uint8Array;
  pubkeyHex: string;

  constructor(secretKeyHex: string) {
    if (!secretKeyHex) {
      throw new Error("secretKeyHex is required");
    }
    this.secretKey = hexToBytes(secretKeyHex);
    this.pubkeyHex = getPublicKey(this.secretKey);
    console.log("pubkey:", this.pubkeyHex)
  }

  createStateEvent(state: TruncatedHassStateWithHash[], topic?: string, mention?: string) {
    return createStateEvent(state, this.secretKey, topic, mention);
  }
}

export class SimulatedDevice {
  secretKey: Uint8Array;
  pubkeyHex: string;
  deviceId: string;
  deviceShortId: string;
  deviceType: string;

  constructor(secretKeyHex: string, deviceType: string) {
    this.secretKey = hexToBytes(secretKeyHex);
    this.pubkeyHex = getPublicKey(this.secretKey);
    this.deviceId = this.pubkeyHex;
    this.deviceShortId = this.pubkeyHex.slice(0, 4);
    this.deviceType = deviceType;
    console.log(`Simulated device created: type=${deviceType}, deviceId=${this.deviceId}`);
  }

  createStateEvent(state: TruncatedHassStateWithHash[], topic?: string, mention?: string) {
    return createStateEvent(state, this.secretKey, topic, mention);
  }
}
