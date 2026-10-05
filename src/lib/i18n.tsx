import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { en, type Content } from "../content/en";
import { he } from "../content/he";
import type { Lang } from "../config/site";
import { rememberLang } from "./lang";

const dict: Record<Lang, Content> = { he, en };

interface I18n {
  lang: Lang;
  isHe: boolean;
  dir: "rtl" | "ltr";
  t: Content;
  /** Locale-prefixed internal link. */
  href: (path?: string) => string;
  fmtDate: (d: Date) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo<I18n>(() => {
    const t = dict[lang];
    return {
      lang,
      isHe: lang === "he",
      dir: lang === "he" ? "rtl" : "ltr",
      t,
      href: (path = "") => `/${lang}/${path.replace(/^\//, "")}`,
      fmtDate: (d) =>
        lang === "he"
          ? `${t.common.dowsLong[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`
          : `${t.common.dowsLong[d.getDay()]}, ${d.getDate()} ${t.common.months[d.getMonth()]}`,
    };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    rememberLang(lang);
    document.documentElement.dir = value.dir;
  }, [lang, value.dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}
