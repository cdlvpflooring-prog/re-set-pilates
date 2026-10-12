import { useState } from "react";
import { Link } from "react-router-dom";
import { planName } from "../components/blocks";
import { LangToggle, Wordmark } from "../components/Shell";
import { Switch } from "../components/ui";
import { planById } from "../config/pricing";
import { siteConfig } from "../config/site";
import { useI18n } from "../lib/i18n";
import { planEnd, planUsage } from "../lib/plan";
import { useStore } from "../lib/store";

export default function Profile() {
  const { t, href, isHe } = useI18n();
  const store = useStore();
  const [hint, setHint] = useState(false);
  const plan = store.planId ? planById(store.planId) : undefined;

  // Demo usage figures from local bookings; real balances come from Arbox once connected.
  const usage = plan ? planUsage(plan, store.bookings, new Date(), store.planStart) : null;
  const pct = usage && usage.cap ? Math.min(1, usage.used / usage.cap) : 1;
  const since = store.memberSince ? new Date(store.memberSince) : null;
  const until = plan ? planEnd(plan, store.planStart) : new Date();

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

        {plan && usage ? (
          <div className="stack gap-12">
            <span className="eyebrow">{t.profile.membership}</span>
            <div className={`mcard mcard--member mcard--${plan.tone}`}>
              <div className="row between gap-12">
                <Wordmark />
                <span className="mcard__renew">
                  {plan.billingType === "monthly" ? t.profile.renews : t.profile.validUntil}{" "}
                  <b dir="ltr">
                    {until.getDate()}.{until.getMonth() + 1}
                  </b>
                </span>
              </div>
              <div className="stack gap-8">
                <span className="mcard__name">{planName(plan, t)}</span>
                <span className="mcard__usage">
                  {usage.cap === null ? (
                    <>
                      <b>{usage.used}</b> {t.profile.bookedWeek} · {t.profile.unlimitedNote}
                    </>
                  ) : (
                    <>
                      <b>
                        {usage.used} / {usage.cap}
                      </b>{" "}
                      {plan.billingType === "monthly" ? t.profile.bookedWeek : t.profile.bookedPass}
                    </>
                  )}
                </span>
                <span className="mcard__bar" aria-hidden>
                  <i style={{ width: `${Math.round(pct * 100)}%` }} />
                </span>
              </div>
            </div>
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

        <Link to={href("progress")} className="nextstep row between gap-12">
          <span className="stack gap-4">
            <span className="eyebrow">{t.nav.progress}</span>
            <b className="key">{t.profile.progressTeaser}</b>
          </span>
          <span className="chev" aria-hidden />
        </Link>

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
