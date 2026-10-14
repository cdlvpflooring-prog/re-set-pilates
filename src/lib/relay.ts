// Sends form data to the studio's relay (/api/*, a Cloudflare Worker that writes to Airtable).
// If the phone is offline or the relay is down, the message waits in an outbox and is retried on the next visit.
import type { Attribution, RelayEvent, RelayMap, RelayReply } from "./relayTypes";

const OUTBOX = "reset.outbox.v1";
const FIRST_TOUCH = "reset.attribution.v1";

type Queued = { event: RelayEvent; body: unknown; at: number };

function readOutbox(): Queued[] {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? "[]");
  } catch {
    return [];
  }
}
function writeOutbox(items: Queued[]) {
  try {
    localStorage.setItem(OUTBOX, JSON.stringify(items.slice(-30)));
  } catch {
    /* private mode */
  }
}

async function post<E extends RelayEvent>(event: E, body: RelayMap[E] | unknown): Promise<RelayReply> {
  const res = await fetch(`/api/${event}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  const reply = (await res.json().catch(() => ({ ok: false }))) as RelayReply;
  // 4xx means the message itself is wrong; retrying will not help.
  if (!res.ok && res.status >= 500) throw new Error(reply.error ?? `relay ${res.status}`);
  return reply;
}

/**
 * Send one event. Resolves with the relay's reply, or `{ ok: false, queued: true }` when it
 * could not reach the relay and saved the message for later.
 */
export async function relay<E extends RelayEvent>(event: E, body: Omit<RelayMap[E], "attribution" | "page">): Promise<RelayReply & { queued?: boolean }> {
  const full = { ...body, page: location.pathname, attribution: attribution() };
  try {
    return await post(event, full);
  } catch {
    // Cancels and quiz contact details depend on ids from earlier replies; they are still worth retrying.
    writeOutbox([...readOutbox(), { event, body: full, at: Date.now() }]);
    return { ok: false, queued: true };
  }
}

/** Retry anything left in the outbox (called once at start-up). Drops messages older than two weeks. */
export async function flushOutbox() {
  const items = readOutbox().filter((i) => Date.now() - i.at < 14 * 864e5);
  if (!items.length) return;
  const left: Queued[] = [];
  for (const i of items) {
    try {
      await post(i.event, i.body);
    } catch {
      left.push(i);
    }
  }
  writeOutbox(left);
}

/** Remember where this visitor first came from (campaign links, referrer). Call once at start-up. */
export function captureAttribution() {
  try {
    if (localStorage.getItem(FIRST_TOUCH)) return;
    const p = new URLSearchParams(location.search);
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? new URL(document.referrer).hostname : "";
    const a: Attribution = {
      utmSource: p.get("utm_source") ?? undefined,
      utmMedium: p.get("utm_medium") ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
      referrer: ref || undefined,
      landing: location.pathname,
    };
    localStorage.setItem(FIRST_TOUCH, JSON.stringify(a));
  } catch {
    /* private mode */
  }
}

function attribution(): Attribution | undefined {
  try {
    return JSON.parse(localStorage.getItem(FIRST_TOUCH) ?? "null") ?? undefined;
  } catch {
    return undefined;
  }
}
