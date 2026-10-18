// Messages the website sends to the /api relay (worker/index.ts), which writes them to Airtable.
// Shared by the browser and the Worker, so keep this file free of DOM and Worker APIs.

export type Lang = "he" | "en";
export type HeardFrom = "Instagram" | "TikTok" | "Facebook" | "Google" | "Referral" | "Walk-in" | "Other";
export type PrefTime = "Early morning" | "Morning" | "Midday" | "Evening";
export type PayMethod = "arbox" | "bit" | "card";

export const HEARD_FROM: HeardFrom[] = ["Instagram", "TikTok", "Facebook", "Google", "Referral", "Walk-in", "Other"];
export const PREF_TIMES: PrefTime[] = ["Morning", "Midday", "Evening"];

/**
 * Israeli phone number → local digits ("0501234567"), or null when it can't be one.
 * Shared so the form rejects exactly what the relay would reject.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("972")) d = `0${d.slice(3)}`;
  return /^0\d{8,9}$/.test(d) ? d : null;
}

/** Who the person is. Phone is the key used to find them again in Airtable. */
export interface Contact {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

/** Where the visitor first came from (utm_* tags and referrer), kept from their first visit. */
export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landing?: string;
}

interface Base {
  lang: Lang;
  page?: string;
  attribution?: Attribution;
  website?: string; // spam trap; real visitors leave it empty
  retry?: string; // signed pass from a failed attempt (see the outbox in relay.ts); replaces the Turnstile token
}

export interface LeadMsg extends Base {
  contact: Contact;
  interest: string; // service id: reformer | mat | private | duo | women | teens | groups
  note?: string; // free text for the lead's "Message", e.g. the package a group asked about
  prefTime?: PrefTime;
  heard?: HeardFrom;
  consent: boolean;
  turnstile?: string; // Cloudflare Turnstile token (the lead form shows the widget)
}

export interface CheckoutMsg extends Base {
  contact: Contact;
  planId: string; // Plans & Prices > Website ID
  kind?: "reformer" | "mat"; // which class the plan is for (same price); teens plans send none
  method: PayMethod;
  heard?: HeardFrom;
  consent: boolean;
  termsAccepted: true;
}

export interface SlotRef {
  slotId: string; // reformer_2026-10-12_1800
  service: "reformer" | "mat";
  date: string; // YYYY-MM-DD, studio time
  time: string; // HH:mm, studio time
  minutes: number;
  capacity: number | null;
}

export interface BookingMsg extends Base {
  contact: Contact;
  slot: SlotRef;
  bed: number | null; // 0-based on the site; Airtable shows 1-5
}

export interface CancelMsg extends Base {
  bookingId: string; // Airtable record id returned when booking
  phone: string; // must match the booking's member
}

export interface WaitlistMsg extends Base {
  contact: Contact;
  slot: SlotRef;
}

export interface GiftMsg extends Base {
  buyer: Contact;
  planId: string | null; // null = custom amount
  amount?: number; // custom amount in ₪
  recipientName: string;
  note?: string;
  consent: boolean;
}

export interface QuizMsg extends Base {
  goal: "strength" | "calm" | "care" | "together";
  experience: "none" | "some" | "regular";
  style: "group" | "solo" | "pair";
  recommended: "reformer" | "mat" | "private" | "duo";
}

export interface QuizContactMsg extends Base {
  quizId: string;
  contact: Contact;
  consent: boolean;
}

export interface ChatMsg extends Base {
  question: string;
  intent?: string; // scripted answer id; empty when handed to Orit
  handoff: boolean;
}

export interface RelayMap {
  lead: LeadMsg;
  checkout: CheckoutMsg;
  booking: BookingMsg;
  cancel: CancelMsg;
  waitlist: WaitlistMsg;
  gift: GiftMsg;
  quiz: QuizMsg;
  "quiz-contact": QuizContactMsg;
  chat: ChatMsg;
}
export type RelayEvent = keyof RelayMap;

/** What the relay answers. `id` is the main Airtable record created (booking, quiz, gift card). */
export interface RelayReply {
  ok: boolean;
  id?: string;
  code?: string; // gift card code
  error?: string;
  retry?: string; // on a 5xx after the bot check passed: pass for resending the same message later
  airtable?: boolean; // /api/health only
  turnstile?: boolean;
}
