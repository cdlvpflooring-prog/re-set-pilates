import { Link, useSearchParams } from "react-router-dom";
import { LeadForm, MapEmbed, PageHead } from "../components/blocks";
import { packageById } from "../config/packages";
import type { Content } from "../content/en";
import { Verified } from "../components/ui";
import { addressLine, isTodo, mapsLink, siteConfig, telLink } from "../config/site";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { localBusinessLd, useSeo } from "../lib/seo";
import { WaIcon, useWaLink, waReady } from "../lib/whatsapp";

export default function Contact() {
  const { t, isHe, href } = useI18n();
  const [params] = useSearchParams();
  useSeo(t.meta.contact, localBusinessLd(isHe ? "he" : "en"));
  const c = siteConfig.contact;
  const maps = mapsLink();
  const wa = useWaLink();

  return (
    <div className="page tone-dark">
      <PageHead title={t.contact.title} sub={t.contact.sub} />
      <div className="wrap pbody">
        <div className="split split--top screen">
          <div className="stack gap-16">
            {/* Shown once the new WhatsApp number is set in site.ts (no "to be confirmed" placeholders on the page). */}
            {waReady() && (
              <a
                className="card row gap-16"
                style={{ background: "var(--wa)", borderColor: "var(--wa)", color: "var(--wa-ink)" }}
                href={wa}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("whatsapp_click", { source: "contact" })}
              >
                <span className="avatar" style={{ width: 44, height: 44, background: "#fff", color: "var(--wa-ink)" }}>
                  <WaIcon size={24} />
                </span>
                <span className="stack gap-4" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{t.contact.whatsapp}</span>
                  <span className="small">
                    {t.contact.whatsappSub} · <span dir="ltr" style={{ whiteSpace: "nowrap" }}>{c.phone}</span>
                  </span>
                </span>
                <span className="chev" aria-hidden />
              </a>
            )}

            <MapEmbed />
            <div className="card row between gap-16">
              <span className="stack gap-4">
                <span className="key">{addressLine(isHe)}</span>
                <span className="tiny">
                  {t.contact.parking}: <Verified value={c.parking[isHe ? "he" : "en"]} />
                </span>
              </span>
              <a className="btn btn--secondary btn--sm" href={maps} target="_blank" rel="noreferrer">
                {t.common.directions}
              </a>
            </div>

            <div className="card rows" style={{ paddingBlock: 4 }}>
              {!isTodo(c.phone) && (
                <a href={telLink()} onClick={() => track("phone_click", { source: "contact" })}>
                  <span className="muted">{t.contact.phone}</span>
                  <span dir="ltr">{c.phone}</span>
                </a>
              )}
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
              {!isTodo(siteConfig.social.googleBusiness) && (
                <a href={siteConfig.social.googleBusiness} target="_blank" rel="noreferrer">
                  <span className="muted">{t.contact.google}</span>
                  <span>re:set pilates</span>
                </a>
              )}
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
            <LeadForm initialInterest={params.get("interest") ?? undefined} note={packageNote(params.get("package"), t)} />
            {!isTodo(siteConfig.social.googleReview) && (
              <a className="btn btn--secondary btn--block btn--arrow" href={siteConfig.social.googleReview} target="_blank" rel="noreferrer">
                {t.contact.googleReview}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Event package · ₪750" when the visitor arrived from a package card; written to the lead's message. */
function packageNote(id: string | null, t: Content) {
  const pkg = id ? packageById(id) : undefined;
  return pkg ? `${t.services.packages[pkg.id].name} · ₪${pkg.price}` : undefined;
}
