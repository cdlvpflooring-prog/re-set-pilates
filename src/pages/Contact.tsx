import { Link, useSearchParams } from "react-router-dom";
import { LeadForm, MapEmbed, PageHead } from "../components/blocks";
import { Verified } from "../components/ui";
import { isTodo, mapsLink, siteConfig } from "../config/site";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { localBusinessLd, useSeo } from "../lib/seo";

export default function Contact() {
  const { t, isHe, href } = useI18n();
  const [params] = useSearchParams();
  useSeo(t.meta.contact, localBusinessLd(isHe ? "he" : "en"));
  const c = siteConfig.contact;
  const maps = mapsLink();
  const waReady = !isTodo(c.whatsapp);

  return (
    <div className="page tone-dark">
      <PageHead title={t.contact.title} sub={t.contact.sub} />
      <div className="wrap pbody">
        <div className="split split--top screen">
          <div className="stack gap-16">
            <a
              className="card row gap-16"
              style={{ background: "var(--cream)", borderColor: "var(--cream)", color: "var(--charcoal)" }}
              href={waReady ? `https://wa.me/${c.whatsapp}` : undefined}
              aria-disabled={!waReady}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_click", { source: "contact" })}
            >
              <span className="avatar" style={{ width: 44, height: 44, fontSize: 13, fontFamily: "var(--font-ui)", fontWeight: 600, background: "var(--charcoal)", color: "var(--cream)" }}>
                WA
              </span>
              <span className="stack gap-4" style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{t.contact.whatsapp}</span>
                <span className="small" style={{ opacity: 0.7 }}>
                  {waReady ? t.contact.whatsappSub : t.common.pending}
                </span>
              </span>
              <span className="chev" aria-hidden />
            </a>

            <MapEmbed />
            <div className="card row between gap-16">
              <span className="stack gap-4">
                <span style={{ fontWeight: 500 }}>{isHe ? `${c.streetHe}, ${c.cityHe}` : `${c.streetEn}, ${c.cityEn}`}</span>
                <span className="tiny">
                  {t.contact.parking}: <Verified value={c.parking} />
                </span>
              </span>
              <a className="btn btn--secondary btn--sm" href={maps} target="_blank" rel="noreferrer">
                {t.common.directions}
              </a>
            </div>

            <div className="card rows" style={{ paddingBlock: 4 }}>
              <div>
                <span className="muted">{t.contact.phone}</span>
                {isTodo(c.phone) ? <Verified value={c.phone} /> : <a href={`tel:${c.phone}`} dir="ltr">{c.phone}</a>}
              </div>
              <div>
                <span className="muted">{t.contact.hours}</span>
                {isTodo(c.hours) ? (
                  <Link to={href("schedule")} className="link">
                    {t.contact.hoursBySchedule}
                  </Link>
                ) : (
                  c.hours
                )}
              </div>
              <a href={`mailto:${c.email}`}>
                <span className="muted">{t.contact.email}</span>
                <span dir="ltr">{c.email}</span>
              </a>
              <a
                href={isTodo(siteConfig.social.googleBusiness) ? undefined : siteConfig.social.googleBusiness}
                aria-disabled={isTodo(siteConfig.social.googleBusiness)}
                target="_blank"
                rel="noreferrer"
              >
                <span className="muted">{t.contact.google}</span>
                <Verified value={isTodo(siteConfig.social.googleBusiness) ? siteConfig.social.googleBusiness : "re:set pilates"} />
              </a>
              <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer">
                <span className="muted">Instagram</span>
                <span dir="ltr">{siteConfig.social.instagramHandle}</span>
              </a>
              <a href={siteConfig.social.tiktok} target="_blank" rel="noreferrer">
                <span className="muted">TikTok</span>
                <span dir="ltr">{siteConfig.social.tiktokHandle}</span>
              </a>
              <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer">
                <span className="muted">Facebook</span>
                <span>re:set pilates</span>
              </a>
            </div>
          </div>
          <div className="stack gap-16">
            <LeadForm initialInterest={params.get("interest") ?? undefined} />
            <a
              className="btn btn--secondary btn--block btn--arrow"
              href={isTodo(siteConfig.social.googleReview) ? undefined : siteConfig.social.googleReview}
              aria-disabled={isTodo(siteConfig.social.googleReview)}
              target="_blank"
              rel="noreferrer"
            >
              {t.contact.googleReview}
              {isTodo(siteConfig.social.googleReview) ? ` · ${t.common.pending}` : ""}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
