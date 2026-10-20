import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ServiceGlyph } from "../components/art";
import { PageHead, useTurnstile } from "../components/blocks";
import { ConsentField, ContactFields, profileFrom, readContact, readExtras } from "../components/forms";
import { Check } from "../components/ui";
import { packageById } from "../config/packages";
import { services, type ServiceId } from "../config/services";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { relay } from "../lib/relay";
import { PREF_TIMES, type PrefTime } from "../lib/relayTypes";
import { useSeo } from "../lib/seo";
import { useStore } from "../lib/store";

/** Session types a visitor can ask for; the one she arrived with is added if it is not in this list (women, teens). */
const MAIN: ServiceId[] = ["private", "duo", "groups"];
/** Sunday to Friday (the studio is closed on Saturday). */
const DAYS = [0, 1, 2, 3, 4, 5];

/**
 * Request a session: private, duo or a closed group. Pick the type, the days and times that suit,
 * leave a name and phone. It lands in Airtable as a lead whose message carries the type, days, times,
 * package and note, so Orit can call back with a time.
 */
export default function Request() {
  const { t, lang, href } = useI18n();
  const [params] = useSearchParams();
  useSeo({ title: `${t.request.title} | re:set pilates`, desc: t.request.sub });
  const { profile, saveProfile } = useStore();
  const wanted = params.get("type") ?? "private";
  const pkg = packageById(params.get("package") ?? "");
  const options = services.filter((s) => MAIN.includes(s.id) || s.id === wanted);
  const [type, setType] = useState<ServiceId>(options.some((s) => s.id === wanted) ? (wanted as ServiceId) : "private");
  const [days, setDays] = useState<number[]>([]);
  const [times, setTimes] = useState<PrefTime[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "queued" | "failed">("idle");
  const [error, setError] = useState<"phone" | "bot" | null>(null);
  const [started, setStarted] = useState(false);
  const turnstile = useTurnstile(started);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const contact = readContact(f);
    const x = readExtras(f);
    const free = String(f.get("note") ?? "").trim();
    // One readable line for the lead's message
    const note = [
      t.services.items[type].name,
      pkg ? `${t.request.package}: ${t.services.packages[pkg.id].name} · ₪${pkg.price}` : "",
      days.length ? `${t.request.days}: ${days.map((d) => t.common.dowsLong[d]).join(", ")}` : "",
      times.length ? `${t.request.times}: ${times.map((p) => t.form.times[p as keyof typeof t.form.times]).join(", ")}` : "",
      free,
    ]
      .filter(Boolean)
      .join(" · ");
    setState("sending");
    setError(null);
    track("request_form_submit", { type, days: days.length, times: times.length });
    const r = await relay("lead", { lang, contact, interest: type, note, prefTime: times[0], heard: x.heard, consent: x.consent, website: x.website, turnstile: turnstile.token });
    if (r.ok || r.queued) saveProfile(profileFrom(contact, x));
    if (!r.ok && !r.queued && (r.error === "turnstile" || r.error?.startsWith("bad ") || r.error === "missing field")) {
      setError(r.error === "turnstile" ? "bot" : "phone");
      setState("idle");
      return;
    }
    setState(r.ok ? "sent" : r.queued ? "queued" : "failed");
  };

  const done = state === "sent" || state === "queued";

  return (
    <div className="page tone-dark has-tabbar page--still">
      <PageHead title={t.request.title} sub={t.request.sub} />
      <div className="wrap wrap--narrow pbody screen">
        {done ? (
          <div className="stack gap-16 center" style={{ paddingTop: 32 }}>
            <Check />
            <h2 className="display d-md">{t.request.sent}</h2>
            <p className="muted">{state === "queued" ? t.form.saved : t.request.sentSub}</p>
            <Link to={href("schedule")} className="btn btn--primary">
              {t.common.seeSchedule}
            </Link>
          </div>
        ) : (
          <form className="stack gap-32 req" onSubmit={submit} onFocus={() => !started && setStarted(true)}>
            {/* 1 · type */}
            <fieldset className="req__group">
              <legend className="eyebrow">{t.request.what}</legend>
              <div className="req__types" role="radiogroup">
                {options.map((s) => {
                  const c = t.services.items[s.id];
                  const on = type === s.id;
                  return (
                    <button type="button" key={s.id} role="radio" aria-checked={on} className="req__type" onClick={() => setType(s.id)}>
                      <span className="req__glyph">
                        <ServiceGlyph id={s.id} />
                      </span>
                      <b>{c.short}</b>
                      <small>{c.meta}</small>
                    </button>
                  );
                })}
              </div>
              {pkg && (
                <p className="small muted" style={{ margin: 0 }}>
                  {t.request.package}: <b>{t.services.packages[pkg.id].name}</b> · ₪{pkg.price}
                </p>
              )}
            </fieldset>

            {/* 2 · when */}
            <fieldset className="req__group">
              <legend className="eyebrow">{t.request.when}</legend>
              <span className="tiny">{t.request.days}</span>
              <div className="req__days">
                {DAYS.map((d) => (
                  <button type="button" key={d} className="req__day" aria-pressed={days.includes(d)} onClick={() => setDays(toggle(days, d))}>
                    {t.common.dows[d]}
                  </button>
                ))}
              </div>
              <span className="tiny">{t.request.times}</span>
              <div className="row gap-8" style={{ flexWrap: "wrap" }}>
                {PREF_TIMES.map((p) => (
                  <button type="button" key={p} className="pill pill--blush" aria-pressed={times.includes(p)} onClick={() => setTimes(toggle(times, p))}>
                    {t.form.times[p as keyof typeof t.form.times]}
                  </button>
                ))}
              </div>
              {days.length === 0 && times.length === 0 && <span className="tiny muted">{t.request.anyDay}</span>}
            </fieldset>

            {/* 3 · who */}
            <fieldset className="req__group">
              <legend className="eyebrow">{t.request.details}</legend>
              <ContactFields id="req" profile={profile} />
              <div className="field">
                <label htmlFor="req-note">{t.request.note}</label>
                <textarea id="req-note" name="note" className="input" rows={3} maxLength={300} placeholder={t.request.notePlaceholder} />
              </div>
              <ConsentField profile={profile} />
            </fieldset>

            <div ref={turnstile.ref} />
            {error && (
              <p className="small" role="alert" style={{ color: "var(--accent)" }}>
                {error === "phone" ? t.contact.errPhone : t.contact.errBot}
              </p>
            )}
            <button className="btn btn--primary btn--block" disabled={state === "sending"} aria-live="polite">
              {state === "sending" ? t.form.sending : t.request.send}
            </button>
            {state === "failed" && (
              <p className="small center" role="alert">
                {t.form.failed}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
