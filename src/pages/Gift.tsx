import { useState, type FormEvent } from "react";
import { PageHead, effectivePrice, planName, pricesVisible } from "../components/blocks";
import { Wordmark } from "../components/Shell";
import { Check } from "../components/ui";
import { pricing } from "../config/pricing";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { relay } from "../lib/relay";
import { useSeo } from "../lib/seo";
import { useStore } from "../lib/store";
import { ConsentField, ContactFields, profileFrom, readContact, readExtras } from "../components/forms";

/** Gift card flow (mock checkout: nothing is charged or sent). */
export default function Gift() {
  const { t, lang } = useI18n();
  useSeo(t.meta.gift);
  const passes = pricing.passes.filter(pricesVisible);
  const [choice, setChoice] = useState<string>(passes[0]?.id ?? "custom");
  const [amount, setAmount] = useState(300);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [notified, setNotified] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [code, setCode] = useState("");
  const { profile, saveProfile } = useStore();
  const pass = passes.find((p) => p.id === choice);
  const value = pass ? effectivePrice(pass) : amount;
  const label = pass ? planName(pass, t) : t.gift.custom;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const buyer = readContact(f);
    const x = readExtras(f);
    track("gift_card_start", { choice });
    setSending(true);
    setFailed(false);
    const r = await relay("gift", {
      lang,
      buyer,
      planId: pass ? pass.id : null,
      amount: pass ? undefined : amount,
      recipientName: to,
      note: note || undefined,
      consent: x.consent,
      website: x.website,
    });
    if (!r.ok && !r.queued) {
      setSending(false);
      setFailed(true);
      return;
    }
    saveProfile(profileFrom(buyer, x));
    setCode(r.code ?? "");
    setSending(false);
    setDone(true);
  };

  return (
    <div className="page tone-dark has-tabbar">
      <PageHead title={t.gift.title} sub={t.gift.sub} />
      <div className="wrap pbody screen">
        <div className="split split--top">
          <div className="stack gap-12 gift-preview">
            <div className="gift-card" aria-label={t.gift.preview}>
              <div className="row between" style={{ position: "relative" }}>
                <Wordmark />
                <span className="price">
                  <small>₪</small>
                  {value || 0}
                </span>
              </div>
              <div className="stack gap-4" style={{ position: "relative" }}>
                <span className="eyebrow">{t.gift.cardLine}</span>
                <span className="display d-md">{to || "·"}</span>
                <span className="small muted">
                  {label}
                  {from ? ` · ${from}` : ""}
                </span>
                {note && <span className="display italic" style={{ fontSize: 17 }}>“{note}”</span>}
              </div>
            </div>
          </div>

          {done ? (
            <div className="stack gap-16 center" style={{ paddingTop: 16 }}>
              <Check />
              <h2 className="display d-md">{t.gift.doneTitle}</h2>
              <p className="muted">{t.gift.doneSub}</p>
              {code && (
                <p className="key">
                  {t.gift.codeLabel}: <bdi dir="ltr">{code}</bdi>
                </p>
              )}
              <button className="btn btn--secondary" onClick={() => setDone(false)}>
                {t.gift.another}
              </button>
            </div>
          ) : (
            <form className="stack gap-16" onSubmit={submit}>
              <span className="eyebrow">{t.gift.choose}</span>
              <div className="row gap-8" style={{ flexWrap: "wrap" }}>
                {passes.map((p) => (
                  <button type="button" key={p.id} className="pill" aria-pressed={choice === p.id} onClick={() => setChoice(p.id)}>
                    {planName(p, t)}
                  </button>
                ))}
                <button type="button" className="pill" aria-pressed={choice === "custom"} onClick={() => setChoice("custom")}>
                  {t.gift.custom}
                </button>
              </div>
              {choice === "custom" && (
                <div className="field screen">
                  <label htmlFor="g-amount">{t.gift.amount}</label>
                  <input id="g-amount" className="input" type="number" inputMode="numeric" min={50} step={10} dir="ltr" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
                </div>
              )}
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="g-to">{t.gift.to}</label>
                  <input id="g-to" className="input" value={to} onChange={(e) => setTo(e.target.value)} required />
                </div>
                <div className="field">
                  <label htmlFor="g-from">{t.gift.from}</label>
                  <input id="g-from" className="input" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="name" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="g-note">{t.gift.note}</label>
                <textarea id="g-note" className="input" maxLength={120} placeholder={t.gift.notePh} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <fieldset className="stack gap-12" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="eyebrow" style={{ marginBottom: 4 }}>
                  {t.gift.buyerTitle}
                </legend>
                <p className="tiny" style={{ margin: 0 }}>{t.gift.buyerNote}</p>
                <ContactFields id="g" profile={profile} />
                <ConsentField profile={profile} />
              </fieldset>
              <div className="notice">{t.gift.demoPay}</div>
              {failed && (
                <p className="small" role="alert" style={{ margin: 0 }}>
                  {t.form.failed}
                </p>
              )}
              <button className="btn btn--sand btn--block" disabled={sending}>
                {sending ? t.form.sending : t.gift.send}
              </button>
            </form>
          )}
        </div>

        <section className="card row between gap-16" style={{ marginTop: 48, flexWrap: "wrap" }}>
          <div className="stack gap-4">
            <span className="eyebrow">{t.gift.shopEyebrow}</span>
            <h2 className="display d-sm">{t.gift.shopTitle}</h2>
            <p className="small muted">{t.gift.shopBody}</p>
          </div>
          <button className="btn btn--secondary btn--sm" disabled={notified} onClick={() => setNotified(true)}>
            {notified ? t.gift.notified : t.gift.notify}
          </button>
        </section>
      </div>
    </div>
  );
}
