import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeRolledAllocations,
  paymentStatusFromAllocated,
} from "./invoicePaymentAllocation.js";

describe("computeRolledAllocations", () => {
  it("applies forward rollover: surplus on earliest invoice covers later periods", () => {
    const inv = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const raw = { 1: 150, 2: 0, 3: 0 };
    const totals = { 1: 100, 2: 100, 3: 100 };
    const { allocatedById, poolRemainder } = computeRolledAllocations(inv, raw, totals);
    assert.equal(allocatedById[1], 100);
    assert.equal(allocatedById[2], 50);
    assert.equal(allocatedById[3], 0);
    assert.equal(poolRemainder, 0);
  });

  it("applies backward credit: payment recorded only on a later invoice satisfies earlier balance", () => {
    const inv = [{ id: 10 }, { id: 11 }];
    const raw = { 10: 0, 11: 100 };
    const totals = { 10: 100, 11: 100 };
    const { allocatedById } = computeRolledAllocations(inv, raw, totals);
    assert.equal(allocatedById[10], 100);
    assert.equal(allocatedById[11], 0);
  });

  it("does not allocate across unrelated invoice ids in separate runs", () => {
    const eventA = [{ id: 1 }, { id: 2 }];
    const rawA = { 1: 50, 2: 0 };
    const totalsA = { 1: 100, 2: 100 };
    const rA = computeRolledAllocations(eventA, rawA, totalsA);

    const eventB = [{ id: 3 }, { id: 4 }];
    const rawB = { 3: 0, 4: 200 };
    const totalsB = { 3: 100, 4: 100 };
    const rB = computeRolledAllocations(eventB, rawB, totalsB);

    assert.equal(rA.allocatedById[1], 50);
    assert.equal(rA.allocatedById[2], 0);
    assert.equal(rB.allocatedById[3], 100);
    assert.equal(rB.allocatedById[4], 100);
  });
});

describe("paymentStatusFromAllocated", () => {
  it("returns partial between zero and total", () => {
    assert.equal(paymentStatusFromAllocated(40, 100), "partial");
  });
  it("returns full when allocated meets total", () => {
    assert.equal(paymentStatusFromAllocated(100, 100), "full");
  });
});
