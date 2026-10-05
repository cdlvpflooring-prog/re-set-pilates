import type { ReactNode } from "react";
import type { ServiceId } from "../config/services";

// Line art that stands in for photography until the studio shoot. Every arch accepts
// an `image`; when a real photo path is set in config it replaces the drawing.

const P = { pathLength: 1 } as const;

export function ReformerArt({ draw = false }: { draw?: boolean }) {
  return (
    <svg className={`art ${draw ? "art--draw" : ""}`} viewBox="0 0 400 220" role="img" aria-label="Reformer">
      <rect x="24" y="132" width="352" height="16" rx="4" {...P} />
      <line x1="44" y1="148" x2="44" y2="178" {...P} />
      <line x1="356" y1="148" x2="356" y2="178" {...P} />
      <rect x="128" y="114" width="150" height="18" rx="6" {...P} />
      <rect x="244" y="102" width="30" height="12" rx="4" {...P} />
      <rect x="228" y="98" width="8" height="16" rx="2" {...P} />
      <path d="M62 132V86q0-12 12-12h10q12 0 12 12v46" {...P} />
      <path d="M96 123l5-5 5 10 5-10 5 10 5-10 5 5" {...P} />
      <line x1="346" y1="132" x2="346" y2="58" {...P} />
      <circle cx="346" cy="52" r="6" {...P} />
      <path d="M342 56L268 104" {...P} />
      <ellipse cx="262" cy="108" rx="7" ry="4" {...P} />
    </svg>
  );
}

const glyphs: Record<ServiceId, ReactNode> = {
  reformer: (
    <>
      <rect x="10" y="68" width="100" height="8" rx="3" {...P} />
      <rect x="40" y="56" width="44" height="12" rx="4" {...P} />
      <path d="M20 68V46q0-6 6-6t6 6v22" {...P} />
      <line x1="16" y1="76" x2="16" y2="90" {...P} />
      <line x1="104" y1="76" x2="104" y2="90" {...P} />
    </>
  ),
  mat: (
    <>
      <path d="M14 78h70" {...P} />
      <path d="M14 70h62" {...P} />
      <circle cx="90" cy="64" r="14" {...P} />
      <circle cx="90" cy="64" r="7" {...P} />
    </>
  ),
  private: (
    <>
      <circle cx="60" cy="60" r="34" {...P} />
      <circle cx="60" cy="60" r="6" {...P} />
    </>
  ),
  duo: (
    <>
      <circle cx="46" cy="60" r="26" {...P} />
      <circle cx="74" cy="60" r="26" {...P} />
    </>
  ),
  women: (
    <>
      <circle cx="60" cy="60" r="34" {...P} />
      <circle cx="60" cy="50" r="4" {...P} />
      <circle cx="60" cy="70" r="4" {...P} />
    </>
  ),
};

export function ServiceGlyph({ id }: { id: ServiceId }) {
  return (
    <svg className="art" viewBox="0 0 120 120" aria-hidden>
      {glyphs[id]}
    </svg>
  );
}

const tones: Record<ServiceId, string> = { reformer: "", mat: "arch--sand", private: "arch--blush", duo: "arch--paper", women: "arch--blush" };

export function ServiceArch({ id, image, pos }: { id: ServiceId; image?: string; pos?: string }) {
  return (
    <div className={`arch ${tones[id]}`}>
      {image ? <img src={image} alt="" loading="lazy" style={{ objectPosition: pos }} /> : <ServiceGlyph id={id} />}
    </div>
  );
}
