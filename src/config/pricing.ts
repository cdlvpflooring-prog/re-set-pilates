/**
 * PRICE LIST — single source of truth for the whole site (pricing page, Home cards, checkout, receipts, chat, schema.org).
 * Mirrors the owner's three final posters (Oct 2026):
 *
 *   Poster 1 "אימוני פילאטיס מכשירים" (regular prices)
 *     Monthly (valid one month from purchase):  1×/wk ₪240 · 2×/wk ₪460 · 3×/wk ₪630 · 4×/wk ₪800 · Unlimited ₪990
 *     Passes  (valid two months from purchase): 5 = ₪300 (₪60/class) · 10 = ₪550 (₪55/class) · 15 = ₪750 (₪50/class)
 *   Poster 2 "חודש ההשקה" passes:   5+1 = 6 classes ₪300 · 10+1 = 11 classes ₪550 · 15+1 = 16 classes ₪750
 *                                   (the +1 is for purchases during the launch month only, passes only)
 *   Poster 3 "חודש ההשקה" monthly:  1× ₪220 (was 240) · 2× ₪430 (460) · 3× ₪590 (630) · 4× ₪750 (800) · Unlimited ₪920 (990)
 *                                   (launch prices for purchases during the launch month only)
 *
 * Launch overlays apply while `siteConfig.flags.launchPricing` is on (`launchPrice` on monthly plans, `bonusSessions` on passes).
 * Not on the posters, from the owner's earlier flyers / 21 Oct notes: Teens ₪180/month (4 classes), single class ₪55
 * (teens ₪50), closed-group packages in `packages.ts`. The Worker charges what Airtable *Plans & Prices* says, so that table
 * must carry the same numbers (see LAUNCH-CHECKLIST.md "Pricing").
 */
import { siteConfig } from "./site";

/** Which class a membership or pass is for. Reformer and Mat cost the same; the buyer picks one at checkout. */
export type ClassKind = "reformer" | "mat";
export const classKinds: ClassKind[] = ["reformer", "mat"];
export const isClassKind = (v: unknown): v is ClassKind => v === "reformer" || v === "mat";

export interface PricingItem {
  id: string;
  billingType: "monthly" | "pass";
  /** "teens": the girls' weekly group plan — sold on its own tab, not in the general list, and not tied to a class kind. */
  track?: "teens";
  perWeek?: number | "unlimited";
  sessions?: number;
  price: number;
  launchPrice?: number; // monthly launch overlay (poster 3)
  bonusSessions?: number; // pass launch overlay, +1 class (poster 2)
  currency: "ILS";
  popular?: boolean;
  tone: "cream" | "sand" | "ink"; // membership card colour, same on pricing and the member's profile
  validityMonths: number;
  active: boolean;
  approved: boolean; // false => shown with a "pending approval" note (or hidden)
}

export const pricing: { memberships: PricingItem[]; passes: PricingItem[] } = {
  memberships: [
    { id: "m1x", tone: "cream", billingType: "monthly", perWeek: 1, price: 240, launchPrice: 220, currency: "ILS", validityMonths: 1, active: true, approved: true },
    { id: "m2x", tone: "sand", billingType: "monthly", perWeek: 2, price: 460, launchPrice: 430, currency: "ILS", validityMonths: 1, active: true, approved: true },
    { id: "m3x", tone: "sand", billingType: "monthly", perWeek: 3, price: 630, launchPrice: 590, currency: "ILS", validityMonths: 1, popular: true, active: true, approved: true },
    { id: "m4x", tone: "ink", billingType: "monthly", perWeek: 4, price: 800, launchPrice: 750, currency: "ILS", validityMonths: 1, active: true, approved: true },
    { id: "munl", tone: "ink", billingType: "monthly", perWeek: "unlimited", price: 990, launchPrice: 920, currency: "ILS", validityMonths: 1, active: true, approved: true },
    // Teens (girls 12-17): once a week, 4 sessions a month, up to 5 girls. No launch overlay (flyer price).
    { id: "teens", track: "teens", tone: "cream", billingType: "monthly", perWeek: 1, price: 180, currency: "ILS", validityMonths: 1, active: true, approved: true },
  ],
  passes: [
    // One class, Reformer or Mat, adults. Shown on every class page. (Airtable Plans & Prices row `single` must match.)
    { id: "single", tone: "cream", billingType: "pass", sessions: 1, price: 55, currency: "ILS", validityMonths: 1, active: true, approved: true },
    // One class for the teens group (Airtable row `tsingle`).
    { id: "tsingle", track: "teens", tone: "cream", billingType: "pass", sessions: 1, price: 50, currency: "ILS", validityMonths: 1, active: true, approved: true },
    { id: "p5", tone: "cream", billingType: "pass", sessions: 5, price: 300, bonusSessions: 1, currency: "ILS", validityMonths: 2, active: true, approved: true },
    { id: "p10", tone: "sand", billingType: "pass", sessions: 10, price: 550, bonusSessions: 1, currency: "ILS", validityMonths: 2, popular: true, active: true, approved: true },
    { id: "p15", tone: "ink", billingType: "pass", sessions: 15, price: 750, bonusSessions: 1, currency: "ILS", validityMonths: 2, active: true, approved: true },
  ],
};

export const allPlans = [...pricing.memberships, ...pricing.passes];
export const planById = (id: string) => allPlans.find((p) => p.id === id);
/** The general Reformer/Mat list (teens has its own tab). */
export const generalPlans = (list: PricingItem[]) => list.filter((p) => !p.track);
export const teensPlan = pricing.memberships.find((p) => p.track === "teens");
export const singleClass = pricing.passes.find((p) => p.id === "single")!;
export const teenSingleClass = pricing.passes.find((p) => p.id === "tsingle")!;

/** Classes a plan gives in its period: weekly plans × 4 weeks, passes incl. the launch +1. null = unlimited. */
export const planClasses = (p: PricingItem, launch = siteConfig.flags.launchPricing): number | null => {
  if (p.billingType === "monthly") return p.perWeek === "unlimited" ? null : (p.perWeek as number) * 4;
  return (p.sessions ?? 0) + (launch ? (p.bonusSessions ?? 0) : 0);
};
/** What one class costs inside a plan (₪, rounded), e.g. 5-pass ₪60, 15-pass ₪50, launch 15+1 ₪47. null = unlimited. */
export const perClass = (p: PricingItem, launch = siteConfig.flags.launchPricing): number | null => {
  const n = planClasses(p, launch);
  if (!n) return null;
  const price = launch && p.launchPrice ? p.launchPrice : p.price;
  return Math.round(price / n);
};
/** The cheapest per-class price among the visible plans of a track ("with a plan from ₪50"). */
const bestPerClass = (plans: PricingItem[], launch: boolean) =>
  Math.min(...plans.filter((p) => p.active && p.approved && p.sessions !== 1).map((p) => perClass(p, launch) ?? Infinity));

/**
 * Introductory month (owner, 21 Oct 2026, limited time): what one class costs on its own and, at best, with a plan.
 * Adults: single ₪55, with a plan from ₪50 (15-pass; ₪47 with the launch +1). Teens: single ₪50, ₪45 with the monthly plan.
 * The "with a plan" figure is derived from the price list above so it can never drift from it.
 */
export const intro = { active: true };
export const classPrices = (who: "adult" | "teen", launch = siteConfig.flags.launchPricing) =>
  who === "teen"
    ? { single: teenSingleClass.price, plan: (teensPlan && perClass(teensPlan, launch)) || 45 }
    : { single: singleClass.price, plan: bestPerClass(allPlans.filter((p) => !p.track), launch) };
