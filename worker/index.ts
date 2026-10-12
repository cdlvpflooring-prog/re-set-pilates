// Cloudflare Worker for re:set pilates. Static files are served by Cloudflare directly;
// this script only runs for /api/* and /go/* (see run_worker_first in wrangler.jsonc).
//
// Secrets (set with `bunx wrangler secret put NAME`, or in the dashboard as encrypted variables):
//   AIRTABLE_TOKEN    Airtable personal access token, data.records:write on the Reset Pilates base only
//   TURNSTILE_SECRET  Turnstile secret key. When set, every form post must pass the check.
import { isTodo, mapsLink, siteConfig } from "../src/config/site";

interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  AIRTABLE_BASE: string;
  AIRTABLE_TOKEN?: string;
  TURNSTILE_SECRET?: string;
}

// "Leads & Inquiries" in the Reset Pilates base. Field ids stay valid if a column is renamed.
const LEADS = {
  table: "tblJjghK7UpbVBHzb",
  inquiry: "fldrM8xhyEiqAIS16",
  name: "fld4OOKK0Q5o92GKd",
  phone: "fldHr2SNK7OW7vYd7",
  email: "fldZS8vsZ84VcdJsd",
  channel: "fldX3WUV5D0LgBdlG",
  interest: "fldTGNZn8mmsLq3bf",
  message: "fldeQl8VJdYCIDpiX",
  source: "fldtb9JQqzzQrJpmZ",
  status: "fldE87nF37iYCqxxA",
  consent: "fldE1gzZe6goKkj8h",
};

// Website service id → "Interested in" option in Airtable.
const INTEREST: Record<string, string> = {
  reformer: "Reformer",
  mat: "Mat",
  private: "Private 1:1",
  duo: "Duo",
  women: "Women-only",
  gift: "Gift card",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

async function passesTurnstile(env: Env, token: string, ip: string | null) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const out = (await r.json()) as { success?: boolean };
  return out.success === true;
}

async function lead(req: Request, env: Env) {
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
  // Only accept posts from our own pages.
  const origin = req.headers.get("origin");
  if (!origin || new URL(origin).host !== new URL(req.url).host) return json({ ok: false, error: "origin" }, 403);
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return json({ ok: false, error: "size" }, 413);
  if (!env.AIRTABLE_TOKEN) return json({ ok: false, error: "not_configured" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "json" }, 400);
  }
  // Hidden "website" field: people never fill it, bots do. Pretend success.
  if (clean(body.website, 200)) return json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 30);
  const digits = phone.replace(/\D/g, "");
  const email = clean(body.email, 120);
  if (!name || digits.length < 7 || digits.length > 15) return json({ ok: false, error: "fields" }, 422);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: "fields" }, 422);

  if (!(await passesTurnstile(env, clean(body.turnstile, 2048), req.headers.get("cf-connecting-ip")))) {
    return json({ ok: false, error: "turnstile" }, 403);
  }

  const interest = INTEREST[clean(body.interest, 20)];
  const fields: Record<string, unknown> = {
    [LEADS.inquiry]: `Website form — ${name}`,
    [LEADS.name]: name,
    [LEADS.phone]: phone,
    [LEADS.channel]: "Website form",
    [LEADS.status]: "New",
    [LEADS.source]: clean(body.page, 200),
    [LEADS.consent]: body.consent === true,
  };
  if (email) fields[LEADS.email] = email;
  if (interest) fields[LEADS.interest] = [interest];
  const message = clean(body.message, 2000);
  if (message) fields[LEADS.message] = message;

  const r = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${LEADS.table}`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!r.ok) {
    // Logged for `wrangler tail` / the dashboard; the visitor only sees a generic failure and falls back to email.
    console.error("airtable", r.status, (await r.text()).slice(0, 500));
    return json({ ok: false, error: "upstream" }, 502);
  }
  return json({ ok: true });
}

// Short links for flyers and QR codes: /go/wa, /go/book, … Change the target here, the printed QR stays the same.
function go(slug: string, url: URL) {
  const s = siteConfig.social;
  const c = siteConfig.contact;
  const targets: Record<string, string> = {
    book: "/he/schedule",
    prices: "/he/pricing",
    gift: "/he/gift",
    quiz: "/he/quiz",
    map: mapsLink(),
    ig: s.instagram,
    tiktok: s.tiktok,
    fb: s.facebook,
    wa: isTodo(c.whatsapp) ? "/he/contact" : `https://wa.me/${c.whatsapp}`,
    review: isTodo(s.googleReview) ? "/he/contact" : s.googleReview,
  };
  const to = targets[slug];
  if (!to) return Response.redirect(new URL("/", url).toString(), 302);
  // Keep ?utm_… so campaigns can tell which flyer brought the visit.
  const dest = new URL(to, url);
  if (dest.host === url.host) url.searchParams.forEach((v, k) => dest.searchParams.set(k, v));
  return Response.redirect(dest.toString(), 302);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/lead") return lead(req, env);
    if (url.pathname === "/api/health") {
      return json({ ok: true, airtable: Boolean(env.AIRTABLE_TOKEN), turnstile: Boolean(env.TURNSTILE_SECRET) });
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "not_found" }, 404);
    if (url.pathname.startsWith("/go/")) return go(url.pathname.slice(4).replace(/\/$/, ""), url);
    return env.ASSETS.fetch(req);
  },
};
