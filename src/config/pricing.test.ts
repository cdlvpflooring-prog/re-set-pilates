// The price list must match the owner's three final posters (Oct 2026). Run with `bun test src/`.
import { expect, test } from "bun:test";
import { classPrices, perClass, planById, planClasses, pricing } from "./pricing";
import { packageById } from "./packages";

const price = (id: string) => planById(id)!;

test("poster 1: regular monthly prices, valid one month", () => {
  const want = { m1x: [1, 240], m2x: [2, 460], m3x: [3, 630], m4x: [4, 800] } as const;
  for (const [id, [perWeek, ils]] of Object.entries(want)) {
    const p = price(id);
    expect([p.billingType, p.perWeek, p.price, p.validityMonths, p.active, p.approved]).toEqual(["monthly", perWeek, ils, 1, true, true]);
  }
  expect([price("munl").perWeek, price("munl").price, price("munl").validityMonths]).toEqual(["unlimited", 990, 1]);
});

test("poster 1: passes 5/10/15 at 300/550/750 = ₪60/55/50 a class, valid two months", () => {
  const want = { p5: [5, 300, 60], p10: [10, 550, 55], p15: [15, 750, 50] } as const;
  for (const [id, [sessions, ils, each]] of Object.entries(want)) {
    const p = price(id);
    expect([p.billingType, p.sessions, p.price, p.validityMonths]).toEqual(["pass", sessions, ils, 2]);
    expect(perClass(p, false)).toBe(each);
  }
});

test("poster 2: launch month passes are 5+1, 10+1, 15+1 for the same price", () => {
  expect([planClasses(price("p5"), true), planClasses(price("p10"), true), planClasses(price("p15"), true)]).toEqual([6, 11, 16]);
  for (const id of ["p5", "p10", "p15"]) expect(price(id).launchPrice).toBeUndefined(); // the pass price itself does not change
  for (const id of ["m1x", "m2x", "m3x", "m4x", "munl"]) expect(price(id).bonusSessions).toBeUndefined(); // the +1 is passes only
});

test("poster 3: launch month monthly prices 220/430/590/750/920", () => {
  const want = { m1x: 220, m2x: 430, m3x: 590, m4x: 750, munl: 920 } as const;
  for (const [id, ils] of Object.entries(want)) expect(price(id).launchPrice).toBe(ils);
});

test("not on the posters, from the owner's other flyers: teens, single classes, closed groups", () => {
  expect([price("teens").track, price("teens").price, price("teens").perWeek]).toEqual(["teens", 180, 1]);
  expect([price("single").price, price("tsingle").price]).toEqual([55, 50]);
  expect([packageById("group")!.price, packageById("event")!.price]).toEqual([350, 750]);
});

test("introductory month strip is derived from the list: adults from ₪50 (₪47 with the launch +1), teens ₪45", () => {
  expect(classPrices("adult", false)).toEqual({ single: 55, plan: 50 });
  expect(classPrices("adult", true)).toEqual({ single: 55, plan: 47 });
  expect(classPrices("teen", false)).toEqual({ single: 50, plan: 45 });
});

test("every plan is in exactly one list and ids are unique", () => {
  const ids = [...pricing.memberships, ...pricing.passes].map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
});
