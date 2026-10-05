import { useState, type FormEvent } from "react";
import { PageHead, effectivePrice, planName, pricesVisible } from "../components/blocks";
import { Wordmark } from "../components/Shell";
import { Check } from "../components/ui";
import { pricing } from "../config/pricing";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";

/** Gift card flow (mock checkout — nothing is charged or sent). */
export default function Gift() {
  const { t } = useI18n();
  useSeo(t.meta.gift);
  const passes = pricing.passes.filter(pricesVisible);
  const [choice, setChoice] = useState<string>(passes[0]?.id ?? "custom");
  const [amount, setAmount] = useState(300);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [notified, setNotified] = useState(false);
  const pass = passes.find((p) => p.id === choice);
  const value = pass ? effectivePrice(pass) : amount;
  const label = pass ? planName(pass, t) : t.gift.custom;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    track("gift_card_start", { choice });
    setDone(true);
  };

  return (
    <div className="page tone-dark has-tabbar">
      <PageHead title={t.gift.title} sub={t.gift.sub} />
      <div className="wrap pbody screen">
        <div className="split split--top">
          <div className="stack gap-12" style={{ position: "sticky", top: "calc(var(--hdr) + 20px)" }}>
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
                <span className="display d-md">{to || "—"}</span>
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
              <div className="notice">{t.gift.demoPay}</div>
              <button className="btn btn--sand btn--block">{t.gift.send}</button>
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
