import { SimplePool } from "@nostr/tools/pool";
import { Event, finalizeEvent } from "@nostr/tools/pure";
import { TruncatedHassStateWithHash } from "./hass.ts";

export class NostrPool {
  pool: SimplePool;
  relays: string[];

  constructor(relays: string[]) {
    this.pool = new SimplePool();
    this.relays = relays;
  }

  publish(event: Event) {
    return Promise.any(this.pool.publish(this.relays, event));
  }
}

export function createStateEvent(state: TruncatedHassStateWithHash[], sk: Uint8Array) {
  return finalizeEvent({
    kind: 1,
    content: JSON.stringify(state),
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
  }, sk);
}
