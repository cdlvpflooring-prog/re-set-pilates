import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHead, PricingList, effectivePrice, planName, pricesVisible } from "../components/blocks";
import { Check, Price } from "../components/ui";
import { planById } from "../config/pricing";
import { isTodo, siteConfig } from "../config/site";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { relay } from "../lib/relay";
import { useStore } from "../lib/store";
import { ConsentField, ContactFields, HeardField, profileFrom, readContact, readExtras } from "../components/forms";

export function Pricing() {
  const { t, href } = useI18n();
  const [params] = useSearchParams();
  useSeo(t.meta.pricing);
  return (
    <div className="page tone-dark">
      <PageHead title={t.pricing.title} sub={t.pricing.sub} />
      <div className="wrap wrap--narrow pbody">
        <div className="screen stack gap-32">
          <PricingList next={params.get("next") ?? undefined} />
          <div className="row gap-12" style={{ flexWrap: "wrap" }}>
            <Link to={href("schedule")} className="btn btn--primary" onClick={() => track("book_reformer_click", { source: "pricing" })}>
              {t.common.book}
            </Link>
            <Link to={href("gift")} className="btn btn--secondary">
              {t.nav.gift}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mock checkout: no card data is collected and nothing is charged. */
export function Checkout() {
  const { planId = "" } = useParams();
  const [params] = useSearchParams();
  const { t, href, lang } = useI18n();
  const store = useStore();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const plan = planById(planId);
  const next = params.get("next");

  if (!plan || !pricesVisible(plan))
    return (
      <div className="page page--app tone-dark has-tabbar">
        <div className="wrap wrap--app stack gap-16 center">
          <p className="muted">{t.checkout.notFound}</p>
          <Link to={href("pricing")} className="btn btn--primary">
            {t.nav.pricing}
          </Link>
        </div>
      </div>
    );

  const launch = siteConfig.flags.launchPricing;
  const payLabel = { arbox: t.checkout.payArbox, bit: t.checkout.payBit, card: t.checkout.payCard };
  const linksReady = siteConfig.payments.some((m) => !isTodo(m.url));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const id = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;
    const method = siteConfig.payments.find((m) => m.id === id);
    if (!method) return;
    // Real payment happens at the provider's link (plan-specific Arbox link when configured).
    // The tab is opened now (before anything is awaited, so the browser allows it) and only
    // pointed at the payment page once the order is saved; it is closed if saving fails.
    const url = method.id === "arbox" && !isTodo(plan.arboxUrl) ? plan.arboxUrl : method.url;
    const payTab = isTodo(url) ? null : window.open("", "_blank");
    if (payTab) payTab.opener = null;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const contact = readContact(f);
    const x = readExtras(f);
    setSending(true);
    setFailed(false);
    // Saved in Airtable as a Pending payment until Orit confirms it. A queued order (offline) counts as saved.
    const r = await relay("checkout", { lang, contact, planId: plan.id, method: method.id, heard: x.heard, consent: x.consent, termsAccepted: true, website: x.website });
    if (!r.ok && !r.queued) {
      payTab?.close();
      setSending(false);
      setFailed(true);
      return;
    }
    if (payTab) payTab.location.href = url;
    store.saveProfile(profileFrom(contact, x));
    store.setPlan(plan.id);
    setSending(false);
    setDone(true);
  };

  return (
    <div className="page tone-dark has-tabbar">
      {!done && <PageHead title={t.checkout.title} app />}
      <div className="wrap wrap--app pbody screen">
        {done ? (
          <div className="stack gap-16 center" style={{ paddingTop: 40 }}>
            <Check />
            <h1 className="display d-md">{t.checkout.doneTitle}</h1>
            <p className="muted">{t.checkout.doneSub}</p>
            <Link to={next ? href(`class/${next}`) : href("schedule")} className="btn btn--sand btn--block">
              {t.checkout.doneCta}
            </Link>
          </div>
        ) : (
          <form className="stack gap-24" onSubmit={submit}>
            <div className="member-card row between gap-16">
              <span className="stack gap-4">
                <span className="eyebrow">{t.checkout.summary}</span>
                <span className="display d-sm">{planName(plan, t)}</span>
                <span className="tiny">
                  {plan.billingType === "monthly"
                    ? t.pricing.validMonth
                    : launch && plan.bonusSessions
                      ? t.pricing.bonus
                      : ""}
                </span>
              </span>
              <Price amount={effectivePrice(plan)} was={launch && plan.launchPrice ? plan.price : null} />
            </div>
            <fieldset className="stack gap-12" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="eyebrow" style={{ marginBottom: 12 }}>
                {t.checkout.details}
              </legend>
              <ContactFields id="co" profile={store.profile} />
              <HeardField id="co" profile={store.profile} />
            </fieldset>
            <div className="kv" style={{ borderBottom: 0, fontSize: 16 }}>
              <span>{t.checkout.total}</span>
              <span style={{ direction: "ltr" }}>₪{effectivePrice(plan)}</span>
            </div>
            <div className="stack gap-12">
              <label className="tick">
                <input type="checkbox" name="terms" required />
                <span>{t.form.terms}</span>
              </label>
              <ConsentField profile={store.profile} />
            </div>
            <div className="stack gap-12">
              <span className="eyebrow">{t.checkout.choosePay}</span>
              {siteConfig.payments.map((m, i) => (
                <button key={m.id} name="method" value={m.id} disabled={sending} className={`btn btn--block ${i === 0 ? "btn--sand" : "btn--secondary"}`}>
                  {payLabel[m.id]}
                </button>
              ))}
              {!linksReady && <p className="tiny center">{t.checkout.demoPay}</p>}
              {failed && (
                <p className="small center" role="alert">
                  {t.form.failed}
                </p>
              )}
            </div>
            {!plan.approved && (
              <p className="tiny center">
                {t.pricing.pendingApproval}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
