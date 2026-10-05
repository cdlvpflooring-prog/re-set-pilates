import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pricing, type PricingItem } from "../config/pricing";
import { services, type ServiceConfig, type ServiceId } from "../config/services";
import { isTodo, mapsEmbedSrc, siteConfig } from "../config/site";
import { instructors, reviews, type Person } from "../config/team";
import type { Content } from "../content/en";
import { track } from "../lib/analytics";
import { bookingProvider, toISO, upcomingDays, type BookableService, type ClassSlot } from "../lib/booking";
import { useI18n } from "../lib/i18n";
import { useStore } from "../lib/store";
import { MaskImg, Price, Segmented } from "./ui";

export const instructorName = (id: string, isHe: boolean) => {
  const i = instructors.find((x) => x.id === id);
  return i ? (isHe ? i.nameHe : i.nameEn) : "";
};

/** Same dark title band at the top of every inner page. */
export function PageHead({ title, sub, app = false }: { title: string; sub?: string; app?: boolean }) {
  return (
    <header className="phead tone-dark">
      <div className={`wrap ${app ? "wrap--app" : ""} stack gap-8 screen`}>
        <h1 className="display phead__title">{title}</h1>
        {sub && <p className="lede">{sub}</p>}
      </div>
    </header>
  );
}

/** Portrait (or monogram placeholder), name, role and short bio. */
export function PersonCard({ p, sample = false }: { p: Person; sample?: boolean }) {
  const { isHe, t } = useI18n();
  const name = isHe ? p.nameHe : p.nameEn;
  return (
    <div className="stack gap-12">
      {p.portrait ? (
        <MaskImg src={p.portrait} alt={name} ratio="4 / 5" />
      ) : (
        <div className="portrait" role="img" aria-label={`${name} · ${t.about.portraitSoon}`}>
          <span className="portrait__mono">{name[0]}</span>
          <span>{t.about.portraitSoon}</span>
        </div>
      )}
      <div className="stack gap-4">
        <span className="display d-sm">{name}</span>
        <span className="eyebrow">{isHe ? p.roleHe : p.roleEn}</span>
      </div>
      <p className="small muted">{isHe ? p.bioHe : p.bioEn}</p>
      {sample && !p.approved && <span className="badge badge--outline" style={{ alignSelf: "flex-start" }}>{t.common.sample}</span>}
    </div>
  );
}

export const planName = (p: PricingItem, t: Content) =>
  p.billingType === "monthly"
    ? p.perWeek === "unlimited"
      ? t.pricing.unlimited
      : `${p.perWeek}× ${t.pricing.perWeek}`
    : `${p.sessions} ${t.pricing.sessions}`;

export const pricesVisible = (p: PricingItem) => p.active && (p.approved || siteConfig.flags.showUnapprovedPrices);
export const effectivePrice = (p: PricingItem) =>
  siteConfig.flags.launchPricing && p.launchPrice ? p.launchPrice : p.price;

/** Where a service's primary CTA leads. */
export const serviceTarget = (s: ServiceConfig, href: (p?: string) => string) =>
  s.bookable ? href(`schedule?service=${s.id}`) : href(`contact?interest=${s.id}`);

export function ServiceCard({ s, delay = 0 }: { s: ServiceConfig; delay?: number }) {
  const { t, href } = useI18n();
  const c = t.services.items[s.id];
  return (
    <Link to={href(`services/${s.slug}`)} className="svc-card" onClick={() => track("service_view", { service: s.id })}>
      <MaskImg src={s.image} pos={s.pos} delay={delay} zoom>
        {!s.bookable && <span className="badge badge--blush svc-card__badge">{t.common.byRequest}</span>}
      </MaskImg>
      <div className="svc-card__cap">
        <span className="eyebrow">{c.meta}</span>
        <span className="display d-sm">{c.name}</span>
      </div>
    </Link>
  );
}

export function SlotRow({ slot, index = 0 }: { slot: ClassSlot; index?: number }) {
  const { t, href, isHe } = useI18n();
  const { upcoming } = useStore();
  const mine = upcoming.some((b) => b.slotId === slot.id);
  const cap = slot.capacity;
  // Your own booking takes a bed too.
  const taken = slot.takenBeds.length + (mine && !slot.full ? 1 : 0);
  const left = cap ? cap - taken : null;
  const full = slot.full || left === 0;
  const status = mine
    ? t.schedule.booked
    : cap === null
      ? t.schedule.smallGroup
      : full
        ? t.schedule.full
        : left === 1
          ? t.schedule.lastSpot
          : `${left} ${t.schedule.spotsLeft}`;
  return (
    <Link to={href(`class/${slot.id}`)} className="slot2" style={{ "--i": index } as CSSProperties}>
      <span className="row between gap-12">
        <span className="slot2__time nums">{slot.time}</span>
        <span className={`slot2__spots ${mine ? "is-mine" : full ? "is-full" : left === 1 ? "is-last" : ""}`}>{status}</span>
      </span>
      <span className="slot2__name">{t.services.items[slot.service].name}</span>
      <span className="small muted">
        {t.home.withInstructor} {instructorName(slot.instructorId, isHe)}
      </span>
      <span className="row between gap-12" style={{ marginTop: 6 }}>
        <span className="small muted">
          {slot.minutes} {t.common.min}
        </span>
        <span className={`btn btn--sm ${mine || full ? "btn--secondary" : "btn--primary"} slot2__go`}>
          {mine ? t.schedule.booked : full ? t.my.waitlist : t.common.bookShort}
        </span>
      </span>
    </Link>
  );
}

export function PricingList({ next, limit }: { next?: string; limit?: boolean }) {
  const { t, href } = useI18n();
  const [tab, setTab] = useState<"monthly" | "passes">("monthly");
  const launch = siteConfig.flags.launchPricing;
  let rows = (tab === "monthly" ? pricing.memberships : pricing.passes).filter(pricesVisible);
  if (limit) rows = rows.filter((r) => r.popular || r.perWeek === 1 || r.perWeek === "unlimited" || r.sessions === 5);
  const anyUnapproved = rows.some((r) => !r.approved);

  if (![...pricing.memberships, ...pricing.passes].some(pricesVisible)) {
    return <p className="card muted">{t.pricing.hidden}</p>;
  }
  return (
    <div className="stack gap-16">
      <div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: "monthly", label: t.pricing.monthly },
            { id: "passes", label: t.pricing.passes },
          ]}
        />
      </div>
      {launch && <div className="notice">{t.common.announcement}</div>}
      <div className="stack gap-12 list-in" key={tab}>
        {rows.map((p, i) => (
          <Link
            key={p.id}
            to={href(`checkout/${p.id}${next ? `?next=${next}` : ""}`)}
            className={`price-row ${p.popular ? "is-pop" : ""}`}
            style={{ "--i": i } as CSSProperties}
            onClick={() => track("membership_click", { plan: p.id })}
          >
            <span className="stack gap-4" style={{ flex: 1 }}>
              <span className="row gap-8" style={{ fontWeight: 500 }}>
                {planName(p, t)}
                {p.popular && <span className="badge">{t.pricing.popular}</span>}
              </span>
              <span className="tiny">
                {p.billingType === "monthly"
                  ? t.pricing.validMonth
                  : `₪${Math.round(p.price / p.sessions!)} ${t.pricing.perSession}${launch && p.bonusSessions ? ` · ${t.pricing.bonus}` : ""}`}
              </span>
            </span>
            <Price amount={effectivePrice(p)} was={launch && p.launchPrice ? p.price : null} />
          </Link>
        ))}
      </div>
      <p className="tiny">{t.pricing.validity}</p>
      {anyUnapproved && (
        <p className="small" style={{ color: "var(--accent)" }}>
          ● {t.pricing.pendingApproval}
        </p>
      )}
    </div>
  );
}

export function LeadForm({ initialInterest }: { initialInterest?: string }) {
  const { t } = useI18n();
  const { profile, saveProfile } = useStore();
  const [interest, setInterest] = useState<string>(initialInterest ?? "reformer");
  const [sent, setSent] = useState(false);
  const [started, setStarted] = useState(false);
  const onStart = () => {
    if (!started) {
      setStarted(true);
      track("lead_form_start");
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Goes to the studio Gmail. Until a form service is connected, this opens a ready-to-send email draft.
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(f.get("name") ?? "");
    const phone = String(f.get("phone") ?? "");
    saveProfile({ name, phone });
    track("lead_form_submit", { interest });
    const subject = `re:set pilates — ${t.contact.leadTitle} (${name})`;
    const body = `${t.contact.fName}: ${name}\n${t.contact.fPhone}: ${phone}\n${t.contact.fInterest}: ${t.services.items[interest as ServiceId]?.name ?? interest}`;
    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <form className="card stack gap-16" onSubmit={submit} onFocus={onStart}>
      <div className="stack gap-4">
        <h2 className="display d-sm">{t.contact.leadTitle}</h2>
        <p className="small muted">{t.contact.leadSub}</p>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="lead-name">{t.contact.fName}</label>
          <input id="lead-name" className="input" name="name" autoComplete="name" defaultValue={profile.name} required />
        </div>
        <div className="field">
          <label htmlFor="lead-phone">{t.contact.fPhone}</label>
          <input id="lead-phone" className="input" name="phone" defaultValue={profile.phone} type="tel" inputMode="tel" autoComplete="tel" required dir="ltr" />
        </div>
      </div>
      <div className="stack gap-8">
        <span className="tiny">{t.contact.fInterest}</span>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {services.map((s) => (
            <button
              type="button"
              key={s.id}
              className="pill pill--blush"
              aria-pressed={interest === s.id}
              onClick={() => setInterest(s.id)}
            >
              {t.services.items[s.id as ServiceId].short}
            </button>
          ))}
        </div>
      </div>
      <button className={`btn ${sent ? "btn--secondary" : "btn--blush"}`} disabled={sent} aria-live="polite">
        {sent ? t.contact.sent : t.contact.send}
      </button>
    </form>
  );
}

/** Service chips, day strip and bookable class list. State lives in the URL (?service=&date=). */
export function ScheduleBoard() {
  const { t, href } = useI18n();
  const [params, setParams] = useSearchParams();
  const service: BookableService = params.get("service") === "mat" ? "mat" : "reformer";
  const days = upcomingDays(10);
  // Default to the first day that still has classes (today may already be over).
  const [firstOpen, setFirstOpen] = useState(toISO(days[0]));
  const date = params.get("date") ?? firstOpen;
  const [slots, setSlots] = useState<ClassSlot[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      for (const d of upcomingDays(4)) {
        if ((await bookingProvider.getSchedule(service, toISO(d))).length) {
          if (alive) setFirstOpen(toISO(d));
          return;
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [service]);

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    p.set(k, v);
    setParams(p, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    track("schedule_view", { service });
  }, [service]);

  useEffect(() => {
    let alive = true;
    bookingProvider.getSchedule(service, date).then((s) => alive && setSlots(s));
    return () => {
      alive = false;
    };
  }, [service, date]);

  return (
    <div className="stack gap-16">
      <div className="row gap-8">
        {(["reformer", "mat"] as const).map((s) => (
          <button key={s} className="pill" aria-pressed={service === s} onClick={() => set("service", s)}>
            {t.services.items[s].short}
          </button>
        ))}
      </div>
      <div className="days" role="tablist" aria-label={t.schedule.title}>
        {days.map((d, i) => {
          const iso = toISO(d);
          return (
            <button key={iso} role="tab" className="day" aria-selected={iso === date} onClick={() => set("date", iso)}>
              {i === 0 ? t.common.today : t.common.dows[d.getDay()]}
              <b>{d.getDate()}</b>
            </button>
          );
        })}
      </div>
      <div className="stack list-in" key={`${service}-${date}`} aria-live="polite">
        {slots?.length === 0 && <p className="card card--dashed small muted center">{t.schedule.closedDay}</p>}
        {slots?.map((s, i) => <SlotRow key={s.id} slot={s} index={i} />)}
      </div>
      {!bookingProvider.isLive && <p className="tiny center">{t.common.demoData}</p>}
      <div className="card row between gap-16">
        <span className="stack gap-4">
          <span style={{ fontWeight: 500 }}>{t.schedule.privateDuo}</span>
          <span className="tiny">{t.schedule.byAppointment}</span>
        </span>
        <Link to={href("contact?interest=private")} className="btn btn--blush btn--sm">
          {t.schedule.request}
        </Link>
      </div>
    </div>
  );
}

/** Google-style review cards. Real, approved reviews always show; labelled samples only in demo mode. */
export function GoogleReviews() {
  const { t, isHe } = useI18n();
  if (!siteConfig.flags.showReviews) return null;
  const real = reviews.filter((r) => r.approved);
  const list = real.length > 0 ? real : siteConfig.flags.demoMode ? reviews.filter((r) => r.sample) : [];
  if (list.length === 0) return null;
  const g = siteConfig.social;
  return (
    <div className="quotes">
      <div className="row between gap-12 wrap-row">
        <p className="row gap-8 eyebrow" style={{ color: "var(--ink)" }}>
          <GoogleG /> {t.home.googleTitle}
        </p>
        <div className="row gap-8 wrap-row">
          {!isTodo(g.googleBusiness) && (
            <a className="btn btn--sm btn--secondary" href={g.googleBusiness} target="_blank" rel="noreferrer">
              {t.home.googleRead}
            </a>
          )}
          <a
            className="btn btn--sm btn--primary btn--arrow"
            href={isTodo(g.googleReview) ? undefined : g.googleReview}
            aria-disabled={isTodo(g.googleReview)}
            target="_blank"
            rel="noreferrer"
          >
            {t.home.googleWrite}
          </a>
        </div>
      </div>
      <div className="grid-3">
        {list.slice(0, 3).map((r) => (
          <figure key={r.id} className={`quote ${r.sample ? "quote--sample" : ""}`}>
            <span className="stars" aria-label={`${r.stars ?? 5} / 5`}>
              {"★★★★★".slice(0, r.stars ?? 5)}
            </span>
            <blockquote>“{isHe ? r.quoteHe : r.quoteEn}”</blockquote>
            <figcaption className="row between gap-8 tiny">
              <span>{r.author}</span>
              {r.source === "google" && <GoogleG small />}
            </figcaption>
            {r.sample && <span className="badge badge--outline">{t.home.sampleBadge}</span>}
          </figure>
        ))}
      </div>
    </div>
  );
}

function GoogleG({ small = false }: { small?: boolean }) {
  const s = small ? 14 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Live Google map of the studio (keyless embed; Google adds its own "Open in Maps" link). */
export function MapEmbed() {
  const { t, lang } = useI18n();
  return (
    <div className="map map--embed">
      <iframe title={t.contact.mapTitle} src={mapsEmbedSrc(lang)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    </div>
  );
}
