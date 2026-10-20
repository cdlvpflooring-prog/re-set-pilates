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
  launchPrice?: number; // monthly launch overlay
  bonusSessions?: number; // pass launch overlay (+1)
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
    // One class, Reformer or Mat (teens may also drop in). Shown on every class page.
    { id: "single", tone: "cream", billingType: "pass", sessions: 1, price: 50, currency: "ILS", validityMonths: 1, active: true, approved: true },
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
