import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from "@noble/hashes/utils";

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
