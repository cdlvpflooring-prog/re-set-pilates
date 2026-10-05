import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { isTodo, siteConfig } from "../config/site";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { ChatWidget } from "./ChatWidget";

const ROOTS = ["", "schedule", "services", "my", "profile"];

export function Wordmark() {
  return (
    <span className="wordmark" aria-label="re:set pilates">
      <span aria-hidden>
        re<i>:</i>set
      </span>
      <small className="wordmark__sub" aria-hidden>
        pilates
      </small>
    </span>
  );
}

function useScrolled(threshold = 24) {
  const [scrolled, set] = useState(false);
  useEffect(() => {
    const on = () => set(scrollY > threshold);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const loc = useLocation();
  const nav = useNavigate();
  const other = lang === "he" ? "en" : "he";
  return (
    <button
      className={`lang ${className}`}
      aria-label={other === "en" ? "Switch to English" : "מעבר לעברית"}
      onClick={() => {
        track("language_switch", { to: other });
        nav(loc.pathname.replace(/^\/(he|en)/, `/${other}`) + loc.search, { replace: true });
      }}
    >
      {t.common.langSwitch}
    </button>
  );
}

function Header({ section }: { section: string }) {
  const { t, href } = useI18n();
  const scrolled = useScrolled();
  const nav = useNavigate();
  const isRoot = ROOTS.includes(section);
  const overHero = section === "" || section === "about";
  const links: [string, string][] = [
    ["schedule", t.nav.schedule],
    ["services", t.nav.services],
    ["pricing", t.nav.pricing],
    ["about", t.nav.about],
    ["contact", t.nav.contact],
  ];
  return (
    <header className={`hdr ${scrolled || !overHero ? "is-solid" : ""} ${isRoot ? "" : "hdr--pushed"}`}>
      <div className="wrap hdr__in">
        <div className="hdr__start">
          {!isRoot && (
            <button className="back hdr__back" onClick={() => (history.length > 1 ? nav(-1) : nav(href()))}>
              <span className="chev chev--back" aria-hidden />
              {t.common.back}
            </button>
          )}
          <nav className="hdr__nav" aria-label={t.common.menu}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={href(to)}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <Link to={href()} className="hdr__brand">
          <Wordmark />
        </Link>
        <div className="hdr__end">
          <LangToggle />
          <Link to={href("profile")} className="icon-btn hdr__profile" aria-label={t.nav.profile}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="10" cy="7" r="3.4" />
              <path d="M3.5 17.5c.8-3.2 3.4-4.8 6.5-4.8s5.7 1.6 6.5 4.8" strokeLinecap="round" />
            </svg>
          </Link>
          <Link to={href("schedule")} className="btn btn--sand btn--sm hdr__book" onClick={() => track("book_reformer_click", { source: "header" })}>
            {t.common.bookShort}
          </Link>
        </div>
      </div>
    </header>
  );
}

function TabBar({ section }: { section: string }) {
  const { t, href } = useI18n();
  const tabs: [string, string][] = [
    ["", t.nav.home],
    ["schedule", t.nav.schedule],
    ["services", t.nav.services],
    ["my", t.nav.mine],
    ["profile", t.nav.profile],
  ];
  const activeKey = section === "class" ? "schedule" : section === "checkout" ? "profile" : section;
  return (
    <nav className="tabbar" aria-label={t.common.menu}>
      {tabs.map(([to, label]) => {
        const active = activeKey === to;
        return (
          <Link key={to} to={href(to)} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            {active && <motion.span layoutId="tabdot" className="tabbar__dot" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer() {
  const { t, href, isHe } = useI18n();
  const c = siteConfig.contact;
  return (
    <footer className="footer tone-dark has-tabbar">
      <div className="wrap">
        <div className="footer__grid">
          <div className="stack gap-12">
            <Wordmark />
            <p className="display d-sm hi">
              {t.footer.tagline}
            </p>
            <p className="small muted">
              {isHe ? `${c.streetHe}, ${c.cityHe}` : `${c.streetEn}, ${c.cityEn}`}
            </p>
          </div>
          <div>
            <h3>{t.footer.explore}</h3>
            <ul>
              <li><Link to={href("schedule")}>{t.nav.schedule}</Link></li>
              <li><Link to={href("services")}>{t.nav.services}</Link></li>
              <li><Link to={href("pricing")}>{t.nav.pricing}</Link></li>
              <li><Link to={href("quiz")}>{t.nav.quiz}</Link></li>
              <li><Link to={href("gift")}>{t.nav.gift}</Link></li>
            </ul>
          </div>
          <div>
            <h3>{t.footer.studio}</h3>
            <ul>
              <li><Link to={href("about")}>{t.nav.about}</Link></li>
              <li><Link to={href("faq")}>{t.nav.faq}</Link></li>
              <li><Link to={href("contact")}>{t.nav.contact}</Link></li>
              <li><a href={`mailto:${siteConfig.contact.email}`} dir="ltr">{siteConfig.contact.email}</a></li>
            </ul>
          </div>
          <div>
            <h3>{t.footer.follow}</h3>
            <ul>
              <li><a href={siteConfig.social.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href={siteConfig.social.tiktok} target="_blank" rel="noreferrer">TikTok</a></li>
              <li><a href={siteConfig.social.facebook} target="_blank" rel="noreferrer">Facebook</a></li>
              {!isTodo(siteConfig.social.googleBusiness) && (
                <li><a href={siteConfig.social.googleBusiness} target="_blank" rel="noreferrer">Google</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer__base">
          <span>© {new Date().getFullYear()} re:set pilates · {t.footer.rights}</span>
          <span>{isHe ? "גזית 1 · הוד השרון" : "GAZIT 1 · HOD HASHARON"}</span>
        </div>
      </div>
    </footer>
  );
}

export function Shell() {
  const { t } = useI18n();
  const loc = useLocation();
  const section = loc.pathname.split("/")[2] ?? "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [loc.pathname]);

  return (
    <>
      <a href="#main" className="skip">
        {t.common.skip}
      </a>
      <Header section={section} />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <TabBar section={section} />
      <ChatWidget />
    </>
  );
}
