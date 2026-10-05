import { siteConfig } from "../config/site";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function downloadIcs(opts: { title: string; start: Date; minutes: number; description?: string }) {
  const end = new Date(opts.start.getTime() + opts.minutes * 60000);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RESET Pilates//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(opts.start)}-${Math.random().toString(36).slice(2)}@resetpilates`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${opts.title} · re:set pilates`,
    `LOCATION:${siteConfig.contact.mapsQuery}`,
    opts.description ? `DESCRIPTION:${opts.description}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:re:set pilates",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "reset-pilates-class.ics";
  a.click();
  URL.revokeObjectURL(url);
}
