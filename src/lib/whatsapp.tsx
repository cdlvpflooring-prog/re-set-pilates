// WhatsApp is the studio's first line of contact. Every WhatsApp button opens a chat with a first message
// that says which page it came from, so Orit can see what the person was looking at.
import { useLocation } from "react-router-dom";
import { serviceBySlug } from "../config/services";
import { isTodo, siteConfig, waLink } from "../config/site";
import { useI18n } from "./i18n";

export const waReady = () => !isTodo(siteConfig.contact.whatsapp);

/** WhatsApp link for the current page, with the matching pre-written message. */
export function useWaLink() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [, , section = "", sub] = pathname.split("/");
  const p = t.wa.prefill;
  const service = section === "services" && sub ? serviceBySlug(sub) : undefined;
  const text = service
    ? p.service.replace("{name}", t.services.items[service.id].name.replace(" · ", " "))
    : section === "checkout" || section === "receipt"
      ? p.pricing
      : section === "progress"
        ? p.profile
        : (p as Record<string, string>)[section] ?? p.home;
  return waLink(text);
}

/** WhatsApp logo (glyph only; colour comes from the button). */
export function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24s8.24 3.7 8.24 8.24c0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.12.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47a.9.9 0 0 0-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}
