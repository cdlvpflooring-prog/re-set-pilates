import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageHead, PricingList, effectivePrice, planName, pricesVisible } from "../components/blocks";
import { Check, Price } from "../components/ui";
import { planById } from "../config/pricing";
import { isTodo, siteConfig } from "../config/site";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { useStore } from "../lib/store";

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
  const { t, href } = useI18n();
  const store = useStore();
  const [done, setDone] = useState(false);
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
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;
    const method = siteConfig.payments.find((m) => m.id === id);
    // Real payment happens at the provider's link (plan-specific Arbox link when configured).
    const url = method?.id === "arbox" && !isTodo(plan.arboxUrl) ? plan.arboxUrl : method?.url;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    store.saveProfile({ name: String(f.get("name") ?? ""), phone: String(f.get("phone") ?? ""), email: String(f.get("email") ?? "") });
    if (!isTodo(url)) window.open(url, "_blank", "noopener");
    store.setPlan(plan.id);
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
              <div className="field">
                <label htmlFor="co-name">{t.checkout.name}</label>
                <input id="co-name" name="name" className="input" autoComplete="name" defaultValue={store.profile.name} required />
              </div>
              <div className="field">
                <label htmlFor="co-phone">{t.checkout.phone}</label>
                <input id="co-phone" name="phone" defaultValue={store.profile.phone} className="input" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required />
              </div>
              <div className="field">
                <label htmlFor="co-email">{t.checkout.email}</label>
                <input id="co-email" name="email" defaultValue={store.profile.email} className="input" type="email" autoComplete="email" dir="ltr" />
              </div>
            </fieldset>
            <div className="kv" style={{ borderBottom: 0, fontSize: 16 }}>
              <span>{t.checkout.total}</span>
              <span style={{ direction: "ltr" }}>₪{effectivePrice(plan)}</span>
            </div>
            <div className="stack gap-12">
              <span className="eyebrow">{t.checkout.choosePay}</span>
              {siteConfig.payments.map((m, i) => (
                <button key={m.id} name="method" value={m.id} className={`btn btn--block ${i === 0 ? "btn--sand" : "btn--secondary"}`}>
                  {payLabel[m.id]}
                </button>
              ))}
              {!linksReady && <p className="tiny center">{t.checkout.demoPay}</p>}
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
