import { siteConfig, type Lang } from "../config/site";

const KEY = "reset.lang";

/** Language the visitor last chose; Hebrew until they pick otherwise. */
export function preferredLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "he" || saved === "en") return saved;
  } catch {
    /* storage blocked */
  }
  return siteConfig.locale.default as Lang;
}

export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* storage blocked */
  }
}
