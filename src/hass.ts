import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from "@noble/hashes/utils";
import { DeviceTypeImportedModule } from "./device-type.ts";

export function truncateState(state: HassState, truncateAttributesFn: (attributes: Record<string, unknown>) => Record<string, unknown>): TruncatedHassStateWithHash {
  const truncatedAttributes = truncateAttributesFn(state.attributes);
  const truncatedState = {
    entity_id: state.entity_id,
    state: state.state,
    truncatedAttributes,
    last_updated: state.last_updated
  };

  const originalJson = JSON.stringify(state);
  const originalHash = bytesToHex(keccak_256(originalJson));
  const contextIdHash = bytesToHex(keccak_256(state.context.id));

  return {
    truncatedState,
    originalHash,
    contextIdHash
  };
}

export type HassState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_reported: string;
  last_updated: string;
  context: {
    id: string;
  } & Record<string, unknown>;
}

export type TruncateHassState = {
  entity_id: string;
  state: string;
  truncatedAttributes: Record<string, unknown>;
  last_updated: string;
}

export type TruncatedHassStateWithHash = {
  truncatedState: TruncateHassState;
  originalHash: string;
  contextIdHash: string;
}

export class HassAccessor {
  hassApi: string;
  token: string;
  loadedDeviceTypesModules: DeviceTypeImportedModule[];

  constructor(hassApi: string, token: string, loadedDeviceTypesModules: DeviceTypeImportedModule[]) {
    if (!hassApi) {
      throw new Error("Home Assistant API URL is required");
    }
    if (!token) {
      throw new Error("Home Assistant API token is required");
    }
    this.hassApi = hassApi;
    this.token = token;
    this.loadedDeviceTypesModules = loadedDeviceTypesModules;
  }

  async request(path: string, method: string, body?: Record<string, unknown>) {
    const response = await fetch(`${this.hassApi}${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return response.json();
  }

  async getStates(): Promise<TruncatedHassStateWithHash[]> {
    const states: HassState[] = await this.request("/api/states", "GET");
    const filteredStates: TruncatedHassStateWithHash[] = [];
    for (const state of states) {
      for (const module of this.loadedDeviceTypesModules) {
        if (state.entity_id.startsWith(module.entityPrefix)) {
          for (const suffix of module.allowedEntitySuffixes) {
            if (state.entity_id.endsWith(suffix)) {
              filteredStates.push(truncateState(state, module.truncateAttributes));
            }
          }
        }
      }
    }
    return filteredStates;
  }
}

