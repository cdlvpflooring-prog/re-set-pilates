// GA4-ready event layer. Pushes to dataLayer when present; no-op otherwise.
export type AnalyticsEvent =
  | "book_reformer_click"
  | "membership_click"
  | "service_view"
  | "schedule_view"
  | "contact_click"
  | "whatsapp_click"
  | "language_switch"
  | "lead_form_start"
  | "lead_form_submit"
  | "booking_confirmed"
  | "waitlist_join"
  | "quiz_complete"
  | "gift_card_start"
  | "chat_open"
  | "chat_question";

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer?.push({ event, ...params });
  if (import.meta.env.DEV) console.debug("[analytics]", event, params);
}
