// After a purchase: keep the receipt on the device, add the in-app notification and, when the visitor already allowed
// notifications for the app, show a system notification too. Email/WhatsApp/SMS copies are sent by the relay.
import type { Contact, PayMethod, Lang } from "./relayTypes";
import type { ReceiptData, ReceiptLine } from "./receipt";

export function buildReceipt(o: {
  no: string;
  lang: Lang;
  contact: Contact;
  line: ReceiptLine;
  method?: PayMethod;
  classesTotal?: number;
  validUntil?: Date;
  giftCode?: string;
}): ReceiptData {
  const c = o.contact;
  return {
    no: o.no,
    issuedAt: new Date().toISOString(),
    lang: o.lang,
    customer: { name: `${c.firstName} ${c.lastName}`.trim(), phone: c.phone, email: c.email },
    lines: [o.line],
    total: o.line.amount,
    method: o.method,
    paid: false,
    ...(o.classesTotal ? { classesTotal: o.classesTotal } : {}),
    ...(o.validUntil ? { validUntil: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(o.validUntil) } : {}),
    ...(o.giftCode ? { giftCode: o.giftCode } : {}),
  };
}

/** System notification through the service worker, only if permission was already granted (never asks here). */
export async function systemNotice(title: string, body: string, url: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    await reg?.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", data: { url }, tag: url });
  } catch {
    /* notifications are a bonus; the in-app notice is always there */
  }
}
