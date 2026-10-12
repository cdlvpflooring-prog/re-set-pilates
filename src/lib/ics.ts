import { siteConfig } from "../config/site";

// iCalendar TEXT values escape backslash, semicolon, comma and newlines.
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
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
    `SUMMARY:${esc(opts.title)} · re:set pilates`,
    `LOCATION:${esc(siteConfig.contact.mapsQuery)}`,
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : "",
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
  // iOS Safari consumes the blob after the click returns; revoking synchronously can cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
