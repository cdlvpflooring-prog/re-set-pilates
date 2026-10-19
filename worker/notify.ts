// Sends a purchase receipt to the buyer on every channel the studio has set up and the buyer gave us:
//   email     Cloudflare Email Service binding EMAIL (send_email in wrangler.jsonc; resetpilates.org onboarded for sending)
//   WhatsApp  Meta WhatsApp Cloud API: secrets WHATSAPP_TOKEN + WHATSAPP_PHONE_ID, var WHATSAPP_RECEIPT_TEMPLATE (approved template)
//   SMS       Twilio, only when WhatsApp is not set up: secrets TWILIO_SID + TWILIO_TOKEN, var TWILIO_FROM
// A channel without its settings is skipped. The in-app notification is added by the site itself.
// The hosted copy (/r/<token>) is the receipt encrypted into the link, so no database is needed and nobody can
// read or change it without the key (RECEIPT_SECRET, or TURNSTILE_SECRET when that is not set).
import { siteConfig } from "../src/config/site";
import { renderReceiptHtml, receiptSubject, receiptText, type ReceiptData } from "../src/lib/receipt";

declare global {
  interface Env {
    EMAIL?: SendEmail;
    RECEIPT_SECRET?: string;
    RECEIPT_FROM?: string; // e.g. "receipts@resetpilates.org"
    WHATSAPP_TOKEN?: string;
    WHATSAPP_PHONE_ID?: string;
    WHATSAPP_RECEIPT_TEMPLATE?: string;
    TWILIO_SID?: string;
    TWILIO_TOKEN?: string;
    TWILIO_FROM?: string;
  }
}

export type Channel = "email" | "whatsapp" | "sms";

/** Which channels a receipt goes out on, given what is configured and what the buyer gave us. */
export function channelsFor(env: Env, r: ReceiptData): Channel[] {
  const out: Channel[] = [];
  if (r.customer.email && env.EMAIL) out.push("email");
  const wa = !!(env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_ID && env.WHATSAPP_RECEIPT_TEMPLATE);
  if (r.customer.phone && wa) out.push("whatsapp");
  else if (r.customer.phone && env.TWILIO_SID && env.TWILIO_TOKEN && env.TWILIO_FROM) out.push("sms");
  return out;
}

/** 050-123-4567 → +972501234567 */
export const e164 = (phone: string) => `+972${phone.replace(/\D/g, "").replace(/^972/, "").replace(/^0/, "")}`;

// ---------- hosted receipt link ----------

const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key(secret: string) {
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`receipt:${secret}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const secretOf = (env: Env) => env.RECEIPT_SECRET || env.TURNSTILE_SECRET;

export async function sealReceipt(secret: string, r: ReceiptData): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(secret), new TextEncoder().encode(JSON.stringify(r))));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return b64url(out);
}

export async function openReceipt(secret: string, token: string): Promise<ReceiptData | null> {
  try {
    const all = unb64url(token);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.slice(0, 12) }, await key(secret), all.slice(12));
    return JSON.parse(new TextDecoder().decode(pt)) as ReceiptData;
  } catch {
    return null;
  }
}

export async function receiptLink(env: Env, origin: string, r: ReceiptData): Promise<string | undefined> {
  const secret = secretOf(env);
  return secret ? `${origin}/r/${await sealReceipt(secret, r)}` : undefined;
}

/** GET /r/<token>: the receipt as a printable page (?type=invoice for the invoice). */
export async function serveReceipt(env: Env, url: URL): Promise<Response> {
  const secret = secretOf(env);
  const r = secret ? await openReceipt(secret, url.pathname.slice(3)) : null;
  const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer" };
  if (!r) return new Response("<!doctype html><meta charset=utf-8><title>re:set pilates</title><p style='font-family:sans-serif;padding:24px'>This receipt link is not valid.</p>", { status: 404, headers });
  return new Response(renderReceiptHtml(r, url.searchParams.get("type") === "invoice" ? "invoice" : "receipt"), { headers });
}

// ---------- senders ----------

async function sendEmail(env: Env, r: ReceiptData, link?: string) {
  await env.EMAIL!.send({
    to: { email: r.customer.email!, name: r.customer.name },
    from: { email: env.RECEIPT_FROM || "receipts@resetpilates.org", name: siteConfig.brand.name },
    replyTo: siteConfig.contact.email,
    bcc: siteConfig.contact.email, // the studio keeps a copy of every receipt
    subject: receiptSubject(r),
    html: renderReceiptHtml(r, "receipt", { link }),
    text: receiptText(r, link),
  });
}

/**
 * WhatsApp only allows a business to message first with an approved template. Expected template body parameters:
 * {{1}} first name, {{2}} receipt number, {{3}} total, {{4}} receipt link. Approve it in Hebrew ("he") and English ("en").
 */
async function sendWhatsApp(env: Env, r: ReceiptData, link?: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: e164(r.customer.phone).slice(1),
      type: "template",
      template: {
        name: env.WHATSAPP_RECEIPT_TEMPLATE,
        language: { code: r.lang },
        components: [
          {
            type: "body",
            parameters: [r.customer.name.split(" ")[0], r.no, `₪${r.total}`, link ?? siteConfig.siteUrl].map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`whatsapp ${res.status} ${await res.text()}`);
}

async function sendSms(env: Env, r: ReceiptData, link?: string) {
  const form = new URLSearchParams({ To: e164(r.customer.phone), From: env.TWILIO_FROM!, Body: receiptText(r, link) });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${env.TWILIO_SID}:${env.TWILIO_TOKEN}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) throw new Error(`sms ${res.status} ${await res.text()}`);
}

/** Sends on each channel; one failing channel never stops the others or the purchase. */
export async function sendReceipt(env: Env, r: ReceiptData, channels: Channel[], link?: string): Promise<void> {
  const send = { email: sendEmail, whatsapp: sendWhatsApp, sms: sendSms };
  const results = await Promise.allSettled(channels.map((c) => send[c](env, r, link)));
  results.forEach((res, i) => {
    if (res.status === "rejected") console.error(JSON.stringify({ msg: "receipt not sent", channel: channels[i], no: r.no, detail: String(res.reason) }));
    else console.log(JSON.stringify({ msg: "receipt sent", channel: channels[i], no: r.no }));
  });
}
