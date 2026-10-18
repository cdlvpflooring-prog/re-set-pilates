// The browser side of the relay: outbox, retries and late booking ids. Run with `bun test src/`.
import { beforeEach, expect, test } from "bun:test";

// --- a tiny stand-in browser ---
const store = new Map<string, string>();
const bus = new EventTarget();
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) },
  location: { pathname: "/he/test", search: "", origin: "https://resetpilates.org" },
  document: { referrer: "" },
  addEventListener: bus.addEventListener.bind(bus),
  removeEventListener: bus.removeEventListener.bind(bus),
  dispatchEvent: bus.dispatchEvent.bind(bus),
});
const { relay, flushOutbox, dropQueued, RELAY_REPLY } = await import("./relay");

type Handler = (event: string, body: Record<string, unknown>) => Promise<Response> | Response;
let handler: Handler;
let calls: { event: string; body: Record<string, unknown> }[];
globalThis.fetch = (async (url: string, init: RequestInit) => {
  const event = String(url).replace("/api/", "");
  const body = JSON.parse(String(init.body));
  calls.push({ event, body });
  return handler(event, body);
}) as typeof fetch;
const reply = (status: number, body: object) => new Response(JSON.stringify(body), { status });
const outbox = () => JSON.parse(store.get("reset.outbox.v1") ?? "[]") as { event: string; ref?: string; body: Record<string, unknown> }[];
const chat = (q: string) => ({ lang: "he" as const, question: q, handoff: false });

beforeEach(() => {
  store.clear();
  calls = [];
  handler = () => reply(200, { ok: true, id: "recOK" });
});

test("a 429 (slow down) is kept for later instead of being dropped", async () => {
  handler = () => reply(429, { ok: false, error: "slow down" });
  const r = await relay("chat", chat("busy"));
  expect(r.queued).toBe(true);
  expect(outbox().length).toBe(1);
});

test("other 4xx replies are final and not queued", async () => {
  handler = () => reply(400, { ok: false, error: "bad phone" });
  const r = await relay("chat", chat("bad"));
  expect(r).toEqual({ ok: false, error: "bad phone" });
  expect(outbox().length).toBe(0);
});

test("a message queued while a flush is running survives the flush", async () => {
  handler = () => reply(500, { ok: false });
  await relay("chat", chat("first"));
  handler = async (_e, body) => {
    // While the old message is being resent, a new one fails and is queued.
    if (body.question === "first") {
      handler = () => reply(500, { ok: false });
      await relay("chat", chat("second"));
      return reply(200, { ok: true });
    }
    return reply(500, { ok: false });
  };
  await flushOutbox();
  expect(outbox().map((i) => i.body.question)).toEqual(["second"]);
});

test("two flushes at once send each message only once", async () => {
  handler = () => reply(500, { ok: false });
  await relay("chat", chat("once"));
  handler = () => reply(200, { ok: true });
  calls = [];
  await Promise.all([flushOutbox(), flushOutbox()]);
  expect(calls.filter((c) => c.body.question === "once").length).toBe(1);
  expect(outbox().length).toBe(0);
});

test("a booking sent late announces its Airtable id with the local booking id", async () => {
  handler = () => reply(503, { ok: false });
  const slot = { slotId: "x", service: "mat" as const, date: "2026-10-20", time: "10:30", minutes: 50, capacity: null };
  await relay("booking", { lang: "he", contact: { firstName: "A", lastName: "B", phone: "0501234567" }, slot, bed: null }, { ref: "b123" });
  expect(outbox()[0].ref).toBe("b123");
  expect(outbox()[0].body.ref).toBeUndefined(); // the ref stays on the device
  const seen: unknown[] = [];
  addEventListener(RELAY_REPLY, (e) => seen.push((e as CustomEvent).detail));
  handler = () => reply(200, { ok: true, id: "recBooking0000001" });
  await flushOutbox();
  expect(seen).toEqual([{ event: "booking", ref: "b123", reply: { ok: true, id: "recBooking0000001" } }]);
});

test("dropQueued removes an unsent booking", async () => {
  handler = () => reply(503, { ok: false });
  const slot = { slotId: "x", service: "mat" as const, date: "2026-10-20", time: "10:30", minutes: 50, capacity: null };
  await relay("booking", { lang: "he", contact: { firstName: "A", lastName: "B", phone: "0501234567" }, slot, bed: null }, { ref: "b9" });
  expect(dropQueued("b9")).toBe(true);
  expect(outbox().length).toBe(0);
});
