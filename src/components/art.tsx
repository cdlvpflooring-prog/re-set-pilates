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
  // Teens: two small figures, side by side
  teens: (
    <>
      <circle cx="44" cy="46" r="10" {...P} />
      <circle cx="76" cy="46" r="10" {...P} />
      <path d="M26 92q0-22 18-22t18 22" {...P} />
      <path d="M58 92q0-22 18-22t18 22" {...P} />
    </>
  ),
  // Closed groups: a ring of five
  groups: (
    <>
      <circle cx="60" cy="60" r="36" {...P} />
      <circle cx="60" cy="30" r="6" {...P} />
      <circle cx="88" cy="50" r="6" {...P} />
      <circle cx="78" cy="84" r="6" {...P} />
      <circle cx="42" cy="84" r="6" {...P} />
      <circle cx="32" cy="50" r="6" {...P} />
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

const tones: Record<ServiceId, string> = { reformer: "", mat: "arch--sand", private: "arch--blush", duo: "arch--paper", women: "arch--blush", teens: "arch--sand", groups: "arch--paper" };

export function ServiceArch({ id, image, pos }: { id: ServiceId; image?: string; pos?: string }) {
  return (
    <div className={`arch ${tones[id]}`}>
      {image ? <img src={image} alt="" loading="lazy" style={{ objectPosition: pos }} /> : <ServiceGlyph id={id} />}
    </div>
  );
}

/** Top-down sketch of one Reformer for the "choose your Reformer" picker: frame rails, headrest, carriage,
 *  shoulder blocks, springs and footbar. Colours come from the tile's `currentColor` and the .bed__* classes. */
export function ReformerSketch() {
  return (
    <svg className="bed__sketch" viewBox="0 0 64 120" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="52" height="112" rx="7" />
      <line x1="12" y1="10" x2="12" y2="110" opacity="0.45" />
      <line x1="52" y1="10" x2="52" y2="110" opacity="0.45" />
      <rect x="20" y="10" width="24" height="9" rx="3" />
      <rect x="16" y="22" width="32" height="46" rx="5" className="bed__carriage" />
      <rect x="15" y="23" width="9" height="12" rx="2" className="bed__block" />
      <rect x="40" y="23" width="9" height="12" rx="2" className="bed__block" />
      <path d="M22 70v4l3 3-3 3 3 3-3 3 3 3-3 3v4M32 70v4l3 3-3 3 3 3-3 3 3 3-3 3v4M42 70v4l3 3-3 3 3 3-3 3 3 3-3 3v4" opacity="0.7" />
      <path d="M14 104h36" strokeWidth="3" />
      <path d="M16 104v6M48 104v6" />
    </svg>
  );
}


/**
 * Side view of a Reformer as a single-weight line drawing: frame on four legs, carriage with its headrest
 * and shoulder blocks, the two risers with pulleys and straps, the springs under the carriage, the footbar.
 * Decorative only (aria-hidden); colour comes from `currentColor`, so it reads on cream and on studio-dark.
 */
export function ReformerLineArt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 260" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* frame rails */}
      <path d="M40 168h560" />
      <path d="M40 184h560" />
      <path d="M40 168v16M600 168v16" />
      {/* legs */}
      <path d="M62 184v48M94 184v48M546 184v48M578 184v48" />
      <path d="M52 232h52M536 232h52" />
      {/* carriage */}
      <rect x="150" y="128" width="236" height="36" rx="10" />
      <path d="M150 146h236" opacity="0.5" />
      {/* headrest */}
      <path d="M386 136h58q10 0 10 10v18" />
      {/* shoulder blocks */}
      <rect x="312" y="100" width="18" height="28" rx="5" />
      <rect x="352" y="100" width="18" height="28" rx="5" />
      {/* springs */}
      <path d="M478 176l4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6" opacity="0.8" />
      <path d="M396 176h82M538 176h16" />
      {/* footbar */}
      <path d="M520 168v-62q0-10 10-10h30q10 0 10 10v62" />
      <path d="M520 112h50" />
      {/* risers, pulleys, straps */}
      <path d="M96 168V44M118 168V44" />
      <circle cx="96" cy="38" r="8" />
      <circle cx="118" cy="38" r="8" />
      <path d="M104 40q60 46 150 70" opacity="0.7" />
      <path d="M126 40q70 40 170 76" opacity="0.7" />
      <path d="M248 108a10 6 0 1 0 20 0a10 6 0 1 0-20 0" />
      <path d="M290 114a10 6 0 1 0 20 0a10 6 0 1 0-20 0" />
    </svg>
  );
}

/**
 * A reformer seen from above, standing upright: headrest at the top, footbar at the bottom,
 * as if the person on it were facing you. Decorative (aria-hidden), drawn in `currentColor`.
 */
export function ReformerTopArt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 660" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* frame with the two rails */}
      <rect x="30" y="24" width="200" height="612" rx="14" />
      <path d="M52 40v580M208 40v580" opacity="0.6" />
      {/* risers and pulleys at the head end, ropes hanging down to the loops */}
      <path d="M30 60h-14M230 60h14" />
      <circle cx="12" cy="60" r="7" />
      <circle cx="248" cy="60" r="7" />
      <path d="M12 67q-2 70 14 150q10 48 26 70" opacity="0.7" />
      <path d="M248 67q2 70-14 150q-10 48-26 70" opacity="0.7" />
      <path d="M42 288a8 11 0 1 0 16 0a8 11 0 1 0-16 0" />
      <path d="M202 288a8 11 0 1 0 16 0a8 11 0 1 0-16 0" />
      {/* carriage */}
      <rect x="64" y="52" width="132" height="300" rx="16" />
      <path d="M130 70v264" opacity="0.35" />
      {/* headrest and shoulder blocks */}
      <rect x="92" y="66" width="76" height="40" rx="12" />
      <rect x="76" y="118" width="24" height="34" rx="7" />
      <rect x="160" y="118" width="24" height="34" rx="7" />
      {/* springs between the carriage and the spring bar */}
      <path d="M86 352v12l-5 8 10 8-10 8 10 8-10 8 10 8-5 8v12M108 352v12l-5 8 10 8-10 8 10 8-10 8 10 8-5 8v12M130 352v12l-5 8 10 8-10 8 10 8-10 8 10 8-5 8v12M152 352v12l-5 8 10 8-10 8 10 8-10 8 10 8-5 8v12M174 352v12l-5 8 10 8-10 8 10 8-10 8 10 8-5 8v12" opacity="0.8" />
      <path d="M52 444h156" />
      {/* footbar, sitting above the foot end */}
      <path d="M30 520h-10v-36q0-8 8-8h204q8 0 8 8v36h-10" />
      <rect x="20" y="468" width="220" height="16" rx="8" />
      {/* standing platform at the foot end */}
      <rect x="52" y="548" width="156" height="70" rx="10" />
      <path d="M52 583h156" opacity="0.5" />
    </svg>
  );
}
