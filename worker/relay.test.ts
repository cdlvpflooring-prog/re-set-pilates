// Runs the relay against an in-memory stand-in for Airtable: `bun test worker/`.
import { beforeEach, expect, test } from "bun:test";
import worker from "./index";
import { F, T } from "./airtable";

type Rec = { id: string; fields: Record<string, unknown> };
let db: Record<string, Rec[]>;
let n = 0;
let airtableDown = false; // when true, every Airtable write answers 500

const PLAN: Rec = { id: "recPlan3xxxxxxxxx", fields: { [F.plans.websiteId]: "m3x", [F.plans.name]: "3× per week", [F.plans.type]: "Monthly", [F.plans.regular]: 630, [F.plans.launch]: 590, [F.plans.validityMonths]: 1 } };
const PASS: Rec = { id: "recPass10xxxxxxxx", fields: { [F.plans.websiteId]: "p10", [F.plans.name]: "10 sessions", [F.plans.type]: "Pass", [F.plans.regular]: 550, [F.plans.bonus]: 1, [F.plans.validityMonths]: 2 } };

beforeEach(() => {
  db = { [T.plans]: [PLAN, PASS], [T.campaigns]: [{ id: "recCampxxxxxxxxxx", fields: { [F.campaigns.utm]: "launch-month" } }] };
  airtableDown = false;
  globalThis.fetch = (async (input: RequestInfo, init?: RequestInit) => {
    const url = new URL(String(input));
    // Turnstile stand-in: only the token "good" passes.
    if (url.hostname === "challenges.cloudflare.com") {
      const token = (init?.body as FormData).get("response");
      return new Response(JSON.stringify({ success: token === "good", "error-codes": token === "good" ? [] : ["invalid-input-response"] }), { status: 200 });
    }
    if (airtableDown && init?.method === "POST") return new Response(JSON.stringify({ error: { type: "DOWN" } }), { status: 500 });
    const [, , , table, id] = url.pathname.split("/");
    const rows = (db[table] ??= []);
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const ok = (v: unknown) => new Response(JSON.stringify(v), { status: 200 });
    if (method === "POST") {
      const r = { id: `rec${String(++n).padStart(14, "0")}`, fields: body.records[0].fields };
      rows.push(r);
      return ok({ records: [r] });
    }
    if (method === "PATCH") {
      const r = rows.find((x) => x.id === id)!;
      Object.assign(r.fields, body.fields);
      return ok(r);
    }
    if (id) return ok(rows.find((x) => x.id === id) ?? Object.values(db).flat().find((x) => x.id === id));
    // Tiny formula support: equality on one field id, or phone digits match.
    const f = url.searchParams.get("filterByFormula") ?? "";
    const want = [...f.matchAll(/'([^']*)'/g)].map((m) => m[1]);
    const hit = rows.filter((r) => Object.values(r.fields).some((v) => want.includes(String(v).replace(/\D/g, "")) || want.includes(String(v)) || want.includes(String(v).toLowerCase())));
    return ok({ records: hit });
  }) as typeof fetch;
});

const env = { AIRTABLE_TOKEN: "test", AIRTABLE_BASE: "appTEST", ASSETS: { fetch: async () => new Response("asset") }, FORM_LIMIT: { limit: async () => ({ success: true }) } } as unknown as Env;
const guarded = { ...env, TURNSTILE_SECRET: "turnstile-secret" } as Env;
const call = (event: string, body: unknown, origin = "https://reset.example", e: Env = env) =>
  worker.fetch(new Request(`https://reset.example/api/${event}`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }) as never, e, {} as never) as Promise<Response>;
const maya = { firstName: "Maya", lastName: "Test", phone: "+972 50-123-4567", email: "maya@example.com" };
const slot = { service: "reformer", date: "2026-10-20", time: "18:00", minutes: 50 };

test("lead creates a member and a lead linked to the campaign", async () => {
  const r = await call("lead", { lang: "he", contact: maya, interest: "reformer", prefTime: "Evening", heard: "Instagram", consent: true, attribution: { utmCampaign: "launch-month" } });
  expect(r.status).toBe(200);
  const [m] = db[T.members];
  expect(m.fields[F.members.phone]).toBe("050-123-4567");
  expect(m.fields[F.members.consent]).toBe(true);
  expect(m.fields[F.members.source]).toBe("Instagram");
  const [l] = db[T.leads];
  expect(l.fields[F.leads.campaign]).toEqual(["recCampxxxxxxxxxx"]);
  expect(l.fields[F.leads.interested]).toEqual(["Reformer"]);
});

test("same phone in another format finds the same member", async () => {
  await call("lead", { lang: "he", contact: maya, interest: "mat", consent: false });
  await call("lead", { lang: "he", contact: { ...maya, phone: "0501234567" }, interest: "reformer", consent: false });
  expect(db[T.members].length).toBe(1);
  expect(db[T.members][0].fields[F.members.interests]).toEqual(["Mat", "Reformer"]);
});

test("checkout prices from Airtable, saves Pending payment and terms date", async () => {
  const r = await call("checkout", { lang: "en", contact: maya, planId: "m3x", method: "card", consent: false, termsAccepted: true });
  expect(r.status).toBe(200);
  const [p] = db[T.payments];
  expect(p.fields[F.payments.amount]).toBe(590);
  expect(p.fields[F.payments.status]).toBe("Pending");
  expect(p.fields[F.payments.method]).toBe("Credit card");
  expect(db[T.memberships][0].fields[F.memberships.status]).toBeUndefined();
  expect(db[T.members][0].fields[F.members.termsOn]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("checkout without accepted terms is refused", async () => {
  const r = await call("checkout", { lang: "en", contact: maya, planId: "m3x", method: "card", consent: false });
  expect(r.status).toBe(400);
  expect(db[T.payments]).toBeUndefined();
});

test("booking creates the class once and maps bed 0 → 1", async () => {
  await call("booking", { lang: "he", contact: maya, slot, bed: 0 });
  await call("booking", { lang: "he", contact: maya, slot: { ...slot }, bed: null });
  expect(db[T.classes].length).toBe(1);
  expect(db[T.classes][0].fields[F.classes.when]).toBe("2026-10-20T15:00:00.000Z"); // 18:00 Israel summer time
  expect(db[T.bookings][0].fields[F.bookings.bed]).toBe("1");
  expect(db[T.bookings][1].fields[F.bookings.bed]).toBe("Any");
});

test("cancel checks the phone and applies the 24-hour rule", async () => {
  const b = await (await call("booking", { lang: "he", contact: maya, slot, bed: 2 })).json();
  const rec = db[T.bookings][0];
  rec.fields[F.bookings.classStartUnix] = Math.floor(Date.now() / 1000) + 3600 * 5; // class in 5 hours
  expect((await call("cancel", { lang: "he", bookingId: b.id, phone: "0509999999" })).status).toBe(400);
  expect((await call("cancel", { lang: "he", bookingId: b.id, phone: "050-123-4567" })).status).toBe(200);
  expect(rec.fields[F.bookings.status]).toBe("Late cancel");
});

test("gift card gets a code and a pending payment; amount limits apply", async () => {
  const r = await (await call("gift", { lang: "he", buyer: maya, planId: null, amount: 300, recipientName: "Shira", consent: false })).json();
  expect(r.code).toMatch(/^RS-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  expect(db[T.payments][0].fields[F.payments.for]).toBe("Gift card");
  expect((await call("gift", { lang: "he", buyer: maya, planId: null, amount: 10, recipientName: "Shira", consent: false })).status).toBe(400);
});

test("quiz saves answers, then contact links a member and a lead", async () => {
  const q = await (await call("quiz", { lang: "he", goal: "care", experience: "none", style: "solo", recommended: "private" })).json();
  expect(db[T.quiz][0].fields[F.quiz.goal]).toBe("Gentle return");
  await call("quiz-contact", { lang: "he", quizId: q.id, contact: maya, consent: true });
  expect(db[T.quiz][0].fields[F.quiz.member]).toEqual([db[T.members][0].id]);
  expect(db[T.leads][0].fields[F.leads.interested]).toEqual(["Private 1:1"]);
  expect(db[T.members][0].fields[F.members.experience]).toBe("New to Pilates");
});

test("chat logs topic and handoff", async () => {
  await call("chat", { lang: "en", question: "How much is a pass?", intent: "price", handoff: false });
  await call("chat", { lang: "en", question: "Can I bring my dog?", handoff: true });
  expect(db[T.chat][0].fields[F.chat.topic]).toBe("Price");
  expect(db[T.chat][1].fields[F.chat.handedToOrit]).toBe(true);
  expect(db[T.chat][1].fields[F.chat.answeredAuto]).toBe(false);
});

test("guards: other sites, spam trap, bad phone, unknown plan", async () => {
  expect((await call("chat", { lang: "en", question: "hi" }, "https://evil.example")).status).toBe(403);
  expect((await call("lead", { lang: "en", contact: maya, interest: "mat", consent: false, website: "spam" })).status).toBe(200);
  expect(db[T.leads]).toBeUndefined();
  expect((await call("lead", { lang: "en", contact: { ...maya, phone: "123" }, interest: "mat", consent: false })).status).toBe(400);
  expect((await call("checkout", { lang: "en", contact: maya, planId: "zzz", method: "bit", consent: false, termsAccepted: true })).status).toBe(400);
});

test("lead with Turnstile on: bad token refused, failed attempt gets a retry pass that works without a token", async () => {
  const lead = { lang: "en", contact: maya, interest: "reformer", consent: false };
  expect((await call("lead", { ...lead, turnstile: "bad" }, undefined, guarded)).status).toBe(403);
  expect((await call("lead", lead, undefined, guarded)).status).toBe(403);
  expect(db[T.leads]).toBeUndefined();

  airtableDown = true;
  const failed = await call("lead", { ...lead, turnstile: "good" }, undefined, guarded);
  expect(failed.status).toBe(502);
  const { retry } = (await failed.json()) as { retry?: string };
  expect(retry).toMatch(/^\d{13}\.[0-9a-f]{64}$/);

  airtableDown = false;
  expect((await call("lead", { ...lead, retry }, undefined, guarded)).status).toBe(200);
  expect(db[T.leads].length).toBe(1);
  // A pass is bound to its event and cannot be forged or reused for another form.
  expect((await call("lead", { ...lead, retry: retry!.replace(/.$/, (c) => (c === "0" ? "1" : "0")) }, undefined, guarded)).status).toBe(403);
});

test("retry pass is only issued once the bot check passed", async () => {
  airtableDown = true;
  const r = await call("lead", { lang: "en", contact: maya, interest: "reformer", consent: false, turnstile: "good" });
  expect(r.status).toBe(502);
  expect(((await r.json()) as { retry?: string }).retry).toBeUndefined(); // Turnstile off: nothing to pass
});


test("localhost origins are refused on the live site", async () => {
  expect((await call("chat", { lang: "en", question: "hi" }, "http://localhost:5173")).status).toBe(403);
  const local = await worker.fetch(
    new Request("http://localhost:8787/api/chat", { method: "POST", headers: { Origin: "http://localhost:5173" }, body: JSON.stringify({ lang: "en", question: "hi" }) }) as never,
    env,
    {} as never,
  );
  expect(local.status).toBe(200); // wrangler dev: both sides local
});

test("a later 'how did you hear' answer replaces the automatic Website source", async () => {
  await call("waitlist", { lang: "he", contact: maya, slot });
  expect(db[T.members][0].fields[F.members.source]).toBe("Website");
  await call("checkout", { lang: "he", contact: maya, planId: "m3x", method: "bit", heard: "Instagram", consent: false, termsAccepted: true });
  expect(db[T.members][0].fields[F.members.source]).toBe("Instagram");
  await call("checkout", { lang: "he", contact: maya, planId: "m3x", method: "bit", heard: "TikTok", consent: false, termsAccepted: true });
  expect(db[T.members][0].fields[F.members.source]).toBe("Instagram"); // a real answer is never overwritten
});
