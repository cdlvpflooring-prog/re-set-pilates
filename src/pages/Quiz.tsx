import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { serviceTarget } from "../components/blocks";
import { serviceById, type ServiceId } from "../config/services";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";

type Rec = "reformer" | "mat" | "private" | "duo";

function recommend(a: string[]): Rec {
  const [goal, , style] = a;
  if (style === "pair" || goal === "together") return "duo";
  if (style === "solo" || goal === "care") return "private";
  if (goal === "calm") return "mat";
  return "reformer";
}

export default function Quiz() {
  const { t, href, dir } = useI18n();
  useSeo(t.meta.quiz);
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<string[]>([]);
  const step = answers.length;
  const total = t.quiz.q.length;
  const done = step >= total;
  const rec = done ? recommend(answers) : null;
  const sign = dir === "rtl" ? -1 : 1;
  const shift = reduce ? 0 : 24 * sign;

  const pick = (id: string) => {
    const next = [...answers, id];
    setAnswers(next);
    if (next.length === total) track("quiz_complete", { result: recommend(next) });
  };

  return (
    <div className="page page--app tone-dark has-tabbar">
      <div className="wrap wrap--app stack gap-24">
        <div className="progress" aria-hidden>
          <i key={step} style={{ width: `${(Math.min(step + (done ? 0 : 1), total) / total) * 100}%`, animation: "none", transition: "width 400ms var(--ease-out)" }} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: shift }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -shift }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
            className="stack gap-24"
          >
            {!done ? (
              <>
                <div className="stack gap-8">
                  <span className="eyebrow">
                    {t.quiz.step} {step + 1} {t.quiz.of} {total}
                  </span>
                  <h1 className="display d-md">{t.quiz.q[step].q}</h1>
                </div>
                <div className="stack gap-12">
                  {t.quiz.q[step].options.map((o) => (
                    <button key={o.id} className="slot" onClick={() => pick(o.id)}>
                      <span style={{ flex: 1, fontWeight: 500 }}>{o.label}</span>
                      <span className="chev" aria-hidden style={{ color: "var(--fg-3)" }} />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button className="btn btn--ghost btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => setAnswers(answers.slice(0, -1))}>
                    {t.common.back}
                  </button>
                )}
              </>
            ) : (
              rec && <Result rec={rec} onAgain={() => setAnswers([])} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  function Result({ rec, onAgain }: { rec: Rec; onAgain: () => void }) {
    const s = serviceById(rec)!;
    const c = t.services.items[rec as ServiceId];
    return (
      <>
        <div className="media" style={{ height: 240 }}>
          <img src={s.image} alt="" style={{ objectPosition: s.pos }} />
          <div className="scrim" />
          <div className="stack gap-4" style={{ position: "absolute", inset: "auto 20px 18px 20px" }}>
            <span className="eyebrow">{t.quiz.resultEyebrow}</span>
            <h1 className="display d-md">{c.name}</h1>
          </div>
        </div>
        <p className="muted">{t.quiz.why[rec]}</p>
        <Link to={serviceTarget(s, href)} className="btn btn--sand btn--block">
          {s.bookable ? t.common.seeSchedule : t.common.requestSession}
        </Link>
        <button className="btn btn--ghost btn--sm" onClick={onAgain}>
          {t.quiz.again}
        </button>
      </>
    );
  }
}
