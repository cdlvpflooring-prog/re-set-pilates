import { useState } from "react";
import { Link } from "react-router-dom";
import { planName } from "../components/blocks";
import { LangToggle } from "../components/Shell";
import { Switch } from "../components/ui";
import { planById } from "../config/pricing";
import { siteConfig } from "../config/site";
import { fromISO } from "../lib/booking";
import { useI18n } from "../lib/i18n";
import { useStore } from "../lib/store";

export default function Profile() {
  const { t, href, isHe } = useI18n();
  const store = useStore();
  const [hint, setHint] = useState(false);
  const plan = store.planId ? planById(store.planId) : undefined;

  // Demo usage figures derived from local bookings; real numbers come from Arbox.
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const thisWeek = store.upcoming.filter((b) => fromISO(b.date) < weekEnd).length;
  let usage = "";
  let pct = 0;
  if (plan?.billingType === "monthly") {
    const cap = plan.perWeek === "unlimited" ? null : plan.perWeek!;
    usage = cap ? `${Math.min(thisWeek, cap)} / ${cap} · ${t.profile.thisWeek}` : `${thisWeek} · ${t.profile.thisWeek}`;
    pct = cap ? Math.min(1, thisWeek / cap) : 1;
  } else if (plan) {
    const total = plan.sessions! + (siteConfig.flags.launchPricing ? (plan.bonusSessions ?? 0) : 0);
    const left = Math.max(0, total - store.bookings.length);
    usage = `${left} ${t.profile.sessionsLeft}`;
    pct = left / total;
  }
  const since = store.memberSince ? new Date(store.memberSince) : null;
  const until = since ? new Date(since) : new Date();
  until.setMonth(until.getMonth() + (plan?.validityMonths ?? 1));

  return (
    <div className="page page--app tone-dark has-tabbar">
      <div className="wrap wrap--app stack gap-24 screen">
        <div className="row gap-16">
          <span className="avatar">{store.isMember ? t.profile.firstName[0] : "✦"}</span>
          <span className="stack gap-4">
            <h1 className="display d-md">{store.isMember ? t.profile.name : t.profile.guest}</h1>
            <span className="small muted">
              {since ? `${t.profile.memberSince} ${t.common.months[since.getMonth()]} ${since.getFullYear()}` : t.profile.guestSub}
            </span>
          </span>
        </div>

        {plan ? (
          <div className="member-card stack gap-16">
            <span className="eyebrow">{t.profile.membership}</span>
            <span className="display d-md">{planName(plan, t)}</span>
            <div className="stack gap-8">
              <span className="small muted">{usage}</span>
              <div className="progress">
                <i style={{ width: `${Math.round(pct * 100)}%` }} />
              </div>
            </div>
            <span className="tiny">
              {plan.billingType === "monthly" ? t.profile.renews : t.profile.validUntil}{" "}
              <span style={{ direction: "ltr", display: "inline-block" }}>
                {until.getDate()}.{until.getMonth() + 1}
              </span>
            </span>
            <Link to={href("pricing")} className="btn btn--secondary btn--sm" style={{ alignSelf: "flex-start" }}>
              {t.profile.manage}
            </Link>
          </div>
        ) : (
          <div className="card stack gap-12">
            <h2 className="display d-sm">{t.profile.noPlan}</h2>
            <p className="small muted">{t.profile.noPlanSub}</p>
            <Link to={href("pricing")} className="btn btn--primary">
              {t.nav.pricing}
            </Link>
          </div>
        )}

        <div className="card rows" style={{ paddingBlock: 4 }}>
          <Link to={href("my")}>
            {t.nav.myClasses}
            <span className="chev" aria-hidden />
          </Link>
          <div>
            {t.profile.language}
            <LangToggle />
          </div>
          <div>
            {t.profile.notifications}
            <Switch checked={store.reminders} onChange={store.setReminders} label={t.profile.notifications} />
          </div>
          <Link to={href("gift")}>
            {t.nav.gift}
            <span className="chev" aria-hidden />
          </Link>
          <Link to={href("about")}>
            {t.nav.about}
            <span className="chev" aria-hidden />
          </Link>
          <Link to={href("faq")}>
            {t.nav.faq}
            <span className="chev" aria-hidden />
          </Link>
          <Link to={href("contact")}>
            {t.nav.contact}
            <span className="chev" aria-hidden />
          </Link>
          <button onClick={() => setHint(!hint)} aria-expanded={hint}>
            {t.profile.install}
            <span className="chev" aria-hidden />
          </button>
        </div>
        {hint && <p className="notice screen">{t.profile.installHint}</p>}

        {siteConfig.flags.demoMode && (
          <button className="btn btn--ghost btn--sm" style={{ border: "1px dashed var(--line-strong)" }} onClick={() => store.setPlan(store.isMember ? null : "m3x")}>
            {t.profile.demo}
          </button>
        )}
        <p className="tiny center">{isHe ? "גזית 1 · הוד השרון" : "GAZIT 1 · HOD HASHARON"}</p>
      </div>
    </div>
  );
}
