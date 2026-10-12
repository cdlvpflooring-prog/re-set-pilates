// Progress charts: hand-drawn SVG, one y-axis each, units on every axis, a table view for
// screen readers and anyone who prefers numbers. Missing check-ins are gaps, never zeros.
import { useState } from "react";
import { useTrainerCopy } from "../content/trainer";
import { fromISO } from "../lib/booking";
import { useI18n } from "../lib/i18n";
import type { Checkin, Session, Week } from "../lib/trainer";

const W = 340;
// Axis labels sit on the reading-start side: left in LTR, right in RTL
const pad = (rtl: boolean) => (rtl ? { t: 12, r: 26, b: 22, l: 8 } : { t: 12, r: 8, b: 22, l: 26 });

function TableToggle({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="chart__tablewrap">
      <button className="chart__tbtn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label}
      </button>
      {open && children}
    </div>
  );
}

const short = (iso: string) => {
  const d = fromISO(iso);
  return `${d.getDate()}.${d.getMonth() + 1}`;
};

/* ---------- Graph 1: classes per week (bars) vs goal (line) ---------- */

export function ConsistencyChart({ weeks }: { weeks: Week[] }) {
  const c = useTrainerCopy().g1;
  const { dir } = useI18n();
  const PAD = pad(dir === "rtl");
  const [hover, setHover] = useState<number | null>(null);
  const H = 170;
  const max = Math.max(4, ...weeks.map((w) => Math.max(w.attended, w.goal ?? 0))) + 0.5;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const bw = iw / weeks.length;
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  // The chart reads oldest → newest in the reading direction
  const x = (i: number) => (dir === "rtl" ? PAD.l + iw - (i + 1) * bw : PAD.l + i * bw);
  const ticks = Array.from({ length: Math.floor(max) + 1 }, (_, i) => i).filter((v) => v % (max > 6 ? 2 : 1) === 0);

  // Goal as a step line so a goal change only affects the weeks after it
  const goalPath = weeks
    .map((w, i) => (w.goal == null ? "" : `${i === 0 || weeks[i - 1].goal == null ? "M" : "L"}${x(i) + (dir === "rtl" ? bw : 0)},${y(w.goal)} H${x(i) + (dir === "rtl" ? 0 : bw)}`))
    .join(" ");

  const h = hover != null ? weeks[hover] : null;
  return (
    <figure className="chart">
      <div className="chart__legend" aria-hidden>
        <span><i className="key-bar" /> {c.sessions}</span>
        <span><i className="key-line" /> {c.goal}</span>
        <span><i className="key-bar key-bar--now" /> {c.thisWeek}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${c.title}. ${c.sub}`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={dir === "rtl" ? W - PAD.r + 6 : PAD.l - 6} y={y(t) + 3.5} className="chart__tick" textAnchor={dir === "rtl" ? "start" : "end"}>
              {t}
            </text>
          </g>
        ))}
        {weeks.map((w, i) => {
          const bh = y(0) - y(w.attended);
          const cls = w.paused ? "chart__bar chart__bar--paused" : !w.complete ? "chart__bar chart__bar--now" : "chart__bar";
          return (
            <g key={w.start} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={x(i)} y={PAD.t} width={bw} height={ih} fill="transparent" />
              {w.paused && w.attended === 0 ? (
                <rect x={x(i) + bw * 0.2} y={y(0) - 6} width={bw * 0.6} height={6} rx={2} className="chart__bar--paused" />
              ) : (
                bh > 0 && <path d={roundTop(x(i) + bw * 0.2, y(w.attended), bw * 0.6, bh, 4)} className={cls} />
              )}
              {i % 3 === (weeks.length - 1) % 3 && (
                <text x={x(i) + bw / 2} y={H - 6} className="chart__tick" textAnchor="middle">
                  {short(w.start)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} className="chart__axis" />
        <path d={goalPath} className="chart__goal" />
      </svg>
      <p className="chart__tip" aria-live="polite">
        {h ? (
          <>
            <b>{c.week} {short(h.start)}</b> · {h.attended}
            {h.goal ? ` / ${h.goal}` : ""} {h.paused ? `· ${c.paused}` : !h.complete ? `· ${c.thisWeek}` : ""}
          </>
        ) : (
          " "
        )}
      </p>
      <TableToggle label={c.table}>
        <table className="chart__table">
          <thead>
            <tr><th>{c.week}</th><th>{c.sessions}</th><th>{c.goal}</th><th /></tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.start}>
                <td>{short(w.start)}</td>
                <td className="nums">{w.attended}</td>
                <td className="nums">{w.goal ?? "·"}</td>
                <td>{w.paused ? c.paused : !w.complete ? c.thisWeek : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableToggle>
    </figure>
  );
}

function roundTop(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

/* ---------- Graph 4: energy and soreness per class, pain as coloured dots ---------- */

const painBand = (p: number) => (p <= 3 ? "ok" : p <= 6 ? "warn" : "bad");

export function RecoveryChart({ checkins, sessions }: { checkins: Checkin[]; sessions: Session[] }) {
  const c = useTrainerCopy().g4;
  const { dir } = useI18n();
  const PAD = pad(dir === "rtl");
  const [hover, setHover] = useState<number | null>(null);
  // Last 12 attended classes; a class without a check-in stays in the series as a gap
  const recent = sessions
    .filter((s) => s.status === "attended")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(-12);
  const pts = recent.map((s) => ({ s, ck: [...checkins].reverse().find((k) => k.sessionId === s.id && k.timing === "post") ?? null }));
  if (!pts.some((p) => p.ck)) return <p className="small muted">{c.empty}</p>;

  const iw = W - PAD.l - PAD.r;
  const step = pts.length > 1 ? iw / (pts.length - 1) : 0;
  const x = (i: number) => (dir === "rtl" ? W - PAD.r - i * step : PAD.l + i * step);

  // Two panels, each with its own single axis (no dual-axis chart)
  const panel = (key: "energy" | "soreness", lo: number, hi: number, H: number) => {
    const ih = H - PAD.t - (key === "soreness" ? 24 : 8); // soreness leaves a row below for pain dots
    const y = (v: number) => PAD.t + ih - ((v - lo) / (hi - lo)) * ih;
    const ticks = key === "energy" ? [1, 3, 5] : [0, 5, 10];
    let d = "";
    let pen = false;
    pts.forEach((p, i) => {
      const v = p.ck?.[key];
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i)},${y(v)} `;
      pen = true;
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={key === "energy" ? c.energy : c.soreness} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={dir === "rtl" ? W - PAD.r + 6 : PAD.l - 6} y={y(t) + 3.5} className="chart__tick" textAnchor={dir === "rtl" ? "start" : "end"}>
              {t}
            </text>
          </g>
        ))}
        <path d={d} className={`chart__line chart__line--${key}`} />
        {pts.map((p, i) => {
          const v = p.ck?.[key];
          return (
            <g key={p.s.id} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={x(i) - step / 2} y={0} width={Math.max(step, 16)} height={H} fill="transparent" />
              {v != null ? (
                <circle cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3.5} className={`chart__dot chart__dot--${key}`} />
              ) : (
                <circle cx={x(i)} cy={y((lo + hi) / 2)} r={3} className="chart__dot--missing" />
              )}
              {key === "soreness" && p.ck?.pain != null && (
                <circle cx={x(i)} cy={H - 4} r={4} className={`pain pain--${painBand(p.ck.pain)}`} />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const h = hover != null ? pts[hover] : null;
  return (
    <figure className="chart">
      <div className="chart__legend" aria-hidden>
        <span><i className="key-line key-line--energy" /> {c.energy}</span>
        <span><i className="key-line key-line--soreness" /> {c.soreness}</span>
      </div>
      <p className="chart__panel">{c.energy}</p>
      {panel("energy", 1, 5, 90)}
      <p className="chart__panel">{c.soreness} · {c.pain}</p>
      {panel("soreness", 0, 10, 136)}
      <div className="chart__legend" aria-hidden>
        <span>{c.pain}:</span>
        {c.painBands.map((b, i) => (
          <span key={b}><i className={`pain pain--${["ok", "warn", "bad"][i]}`} /> {b}</span>
        ))}
        <span><i className="chart__dot--missing key-miss" /> {c.missing}</span>
      </div>
      <p className="chart__tip" aria-live="polite">
        {h ? (
          <>
            <b>{short(h.s.date)}</b> ·{" "}
            {h.ck ? `${c.energy} ${h.ck.energy ?? "·"} · ${c.soreness} ${h.ck.soreness ?? "·"} · ${c.pain} ${h.ck.pain ?? "·"}` : c.missing}
          </>
        ) : (
          " "
        )}
      </p>
      <TableToggle label={c.table}>
        <table className="chart__table">
          <thead>
            <tr><th>{c.date}</th><th>{c.energy}</th><th>{c.soreness}</th><th>{c.pain}</th></tr>
          </thead>
          <tbody>
            {pts.map(({ s, ck }) => (
              <tr key={s.id}>
                <td>{short(s.date)}</td>
                <td className="nums">{ck?.energy ?? "·"}</td>
                <td className="nums">{ck?.soreness ?? "·"}</td>
                <td className="nums">{ck?.pain ?? "·"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableToggle>
    </figure>
  );
}
