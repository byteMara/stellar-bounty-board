import { describe, expect, it } from "vitest";
import { Keypair, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { normalizeEvent } from "../worker/indexer.js";

describe("Soroban indexer event normalization", () => {
  it("normalizes a Bounty/Refund event with its complete payload", () => {
    const maintainer = Keypair.random().publicKey();
    const topic = (name: string) => xdr.ScVal.scvSymbol(name).toXDR("base64");
    const value = nativeToScVal(
      { bounty_id: 12n, maintainer, amount: 500n },
      {
        type: {
          bounty_id: ["symbol", "u64"],
          maintainer: ["symbol", "address"],
          amount: ["symbol", "i128"],
        },
      },
    ).toXDR("base64");

    expect(
      normalizeEvent({
        id: "event-12",
        topic: [topic("Bounty"), topic("Refund")],
        value,
        ledger_closed_at: "2026-10-21T12:00:00Z",
      }),
    ).toMatchObject({
      id: "event-12",
      type: "refund",
      bountyId: "12",
      actor: maintainer,
      maintainer,
      amount: "500",
      timestamp: "2026-10-21T12:00:00Z",
    });
  });
});
