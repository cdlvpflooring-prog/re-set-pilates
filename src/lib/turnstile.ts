// Cloudflare Turnstile (bot check) for the lead form. The site key is public; the secret lives only in the Worker.
import { siteConfig } from "../config/site";

export interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  remove(widgetId: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi | undefined> | undefined;

/** Loads the Turnstile script once. Resolves to undefined when no site key is configured. */
export function loadTurnstile(): Promise<TurnstileApi | undefined> {
  if (!siteConfig.turnstileSiteKey) return Promise.resolve(undefined);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => resolve(undefined);
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Gets a fresh token outside the form (used when resending a message saved in the outbox).
 * The widget stays invisible unless Turnstile needs the visitor to click; then it appears at the bottom of the screen.
 * Resolves to "" when no site key is set or the check cannot complete.
 */
export async function freshTurnstileToken(lang: string, timeoutMs = 20_000): Promise<string> {
  const api = await loadTurnstile();
  if (!api) return "";
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999";
  document.body.appendChild(host);
  let id = "";
  const done = (token: string) => {
    if (id) api.remove(id);
    host.remove();
    return token;
  };
  return new Promise<string>((resolve) => {
    const timer = setTimeout(() => resolve(done("")), timeoutMs);
    try {
      id = api.render(host, {
        sitekey: siteConfig.turnstileSiteKey,
        language: lang,
        appearance: "interaction-only",
        callback: (token: string) => {
          clearTimeout(timer);
          resolve(done(token));
        },
        "error-callback": () => {
          clearTimeout(timer);
          resolve(done(""));
        },
      });
    } catch {
      clearTimeout(timer);
      resolve(done(""));
    }
  });
}
