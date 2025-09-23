import { SimplePool } from "@nostr/tools/pool";
import { Event, finalizeEvent } from "@nostr/tools/pure";
import { TruncatedHassStateWithHash } from "./hass.ts";
import { nip44 } from "@nostr/tools";


export class NostrPool {
  pool: SimplePool;
  relays: string[];

  constructor(relays: string[]) {
    if (!relays.length) {
      throw new Error("At least one Nostr relay is required");
    }
    this.pool = new SimplePool();
    this.relays = relays;
  }

  publish(event: Event) {
    return Promise.any(this.pool.publish(this.relays, event));
  }
}

/**
 * 用 NIP-44 加密 content（如果 mention 提供），否则按原样创建未加密 event。
 *
 * @param state - 要发送的 state 列表
 * @param sk - 你的私钥（Uint8Array）
 * @param topic - 可选 topic tag
 * @param mention - 可选接收者公钥（hex string or bech32，建议 hex）
 */
export function createStateEvent(
  state: TruncatedHassStateWithHash[],
  sk: Uint8Array,
  topic?: string,
  mention?: string
) {
  const plaintext = JSON.stringify(state);
  const createdAt = Math.floor(Date.now() / 1000);
  const expiration = createdAt + 3600; // 1 hour later

  const tags: string[][] = [
    ["s", "dephy-streamr"],
    ["expiration", expiration.toString()],
  ];
  if (topic) tags.push(["t", topic]);
  if (mention) tags.push(["p", mention]);

  let contentToUse: string;
  if (mention) {
    // mention 可能是 bech32 npub 格式或 hex 公钥。尽量接受 hex，否则尝试转换（这里示例假设是 hex）
    const recipientPubkeyHex = mention;

    // NIP-44: 取得共享密钥，然后加密 plaintext
    const shared = nip44.getConversationKey(sk, recipientPubkeyHex);

    // encrypt 返回版本化的字符串（符合 NIP-44 payload）
    // 默认实现会包含 version metadata（取决于库实现）
    const ciphertext = nip44.encrypt(plaintext, shared);

    contentToUse = ciphertext;
  } else {
    // 没有 mention 就直接放明文（或你也可以选择总是加密给自己）
    contentToUse = plaintext;
  }

  return finalizeEvent(
    {
      kind: 1573,
      content: contentToUse,
      created_at: createdAt,
      tags,
    },
    sk
  );
}