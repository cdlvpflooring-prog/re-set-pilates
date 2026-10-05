import { Link, useParams } from "react-router-dom";
import { PageHead, serviceTarget } from "../components/blocks";
import { MaskImg, Reveal } from "../components/ui";
import { serviceBySlug, services } from "../config/services";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";

export function Services() {
  const { t, href } = useI18n();
  useSeo(t.meta.services);
  return (
    <div className="page tone-dark">
      <PageHead title={t.services.title} sub={t.services.sub} />
      <div className="wrap pbody">
        <div className="stack" style={{ gap: "clamp(40px, 7vw, 96px)" }}>
          {services.map((s) => {
            const c = t.services.items[s.id];
            return (
              <article key={s.id} className="split">
                <Link to={href(`services/${s.slug}`)} aria-label={c.name}>
                  <MaskImg src={s.image} pos={s.pos} ratio="4 / 3" zoom>
                    {!s.bookable && (
                      <span className="badge badge--blush" style={{ position: "absolute", top: 14, insetInlineStart: 14 }}>
                        {t.common.byRequest}
                      </span>
                    )}
                  </MaskImg>
                </Link>
                <Reveal className="stack gap-16" delay={120}>
                  <span className="eyebrow">{c.meta}</span>
                  <h2 className="display d-md">{c.name}</h2>
                  <p className="muted">{c.desc}</p>
                  <div className="row gap-8" style={{ flexWrap: "wrap" }}>
                    {c.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="row gap-12" style={{ flexWrap: "wrap", marginTop: 4 }}>
                    <Link
                      to={serviceTarget(s, href)}
                      className={`btn ${s.bookable ? "btn--primary" : "btn--secondary"}`}
                      onClick={() => s.bookable && s.id === "reformer" && track("book_reformer_click", { source: "service" })}
                    >
                      {s.bookable ? t.common.seeSchedule : t.common.requestSession}
                    </Link>
                    <Link to={href(`services/${s.slug}`)} className="link">
                      {t.common.learnMore}
                    </Link>
                  </div>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ServiceDetail() {
  const { slug = "" } = useParams();
  const { t, href } = useI18n();
  const s = serviceBySlug(slug) ?? services[0];
  const c = t.services.items[s.id];
  useSeo({ title: `${c.name} — re:set pilates`, desc: c.desc });
  return (
    <div className="page page--bleed tone-dark">
      <section className="phero">
        <img src={s.image} alt="" style={{ objectPosition: s.pos }} />
        <div className="wrap phero__body stack gap-12">
          <span className="eyebrow fade-up" style={{ color: "var(--cream)" }}>
            {c.meta}
          </span>
          <h1 className="display d-lg fade-up">{c.name}</h1>
        </div>
      </section>
      <section className="section--tight">
        <div className="wrap wrap--narrow stack gap-32">
          <Reveal>
            <p className="display d-sm" style={{ lineHeight: 1.35 }}>
              {c.desc}
            </p>
          </Reveal>
          <Reveal className="rows card" style={{ paddingBlock: 6 }}>
            <div>
              <span className="muted">{t.services.forWho}</span>
              <span style={{ textAlign: "end", maxWidth: "60%", paddingBlock: 12 }}>{c.who}</span>
            </div>
            <div>
              <span className="muted">{t.services.format}</span>
              <span style={{ textAlign: "end", maxWidth: "60%", paddingBlock: 12 }}>{c.format}</span>
            </div>
            <div>
              <span className="muted">{t.services.duration}</span>
              <span>
                {s.minutes} {t.common.min}
              </span>
            </div>
            {s.capacity && (
              <div>
                <span className="muted">{t.services.capacity}</span>
                <span>
                  {t.services.upTo} {s.capacity}
                </span>
              </div>
            )}
          </Reveal>
          <Reveal className="row gap-12" style={{ flexWrap: "wrap" }}>
            <Link to={serviceTarget(s, href)} className="btn btn--primary" onClick={() => s.id === "reformer" && track("book_reformer_click", { source: "service" })}>
              {s.bookable ? t.common.seeSchedule : t.common.requestSession}
            </Link>
            <Link to={href("pricing")} className="btn btn--secondary">
              {t.nav.pricing}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
