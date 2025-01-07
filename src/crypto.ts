import { generateSecretKey, getPublicKey } from '@nostr/tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

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

  toCsvLine() {
    return `${bytesToHex(this.secretKey)},${this.deviceType}`;
  }
}
