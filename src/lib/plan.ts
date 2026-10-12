import type { PricingItem } from "../config/pricing";
import { siteConfig } from "../config/site";
import { fromISO } from "./booking";
import type { Booking } from "./store";

export interface PlanUsage {
  /** Classes already booked in the period that counts (this week for monthly plans, since purchase for passes). */
  used: number;
  /** Classes allowed in that period; null = unlimited. */
  cap: number | null;
  /** Classes still available; Infinity when unlimited, 0 once a pass has expired. */
  left: number;
  /** A pass whose validity ended before `forDate`. */
  expired: boolean;
}

/** Sunday-to-Saturday week (Israeli week) that contains `d`. */
export function weekOf(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

/** Last day a plan bought on `planStart` is valid (monthly plans renew; passes expire). */
export function planEnd(plan: PricingItem, planStart: string | null) {
  const end = planStart ? new Date(planStart) : new Date();
  end.setMonth(end.getMonth() + plan.validityMonths);
  return end;
}

/** When a booking was made; older saved bookings only carry it in their `b<ms>` id. */
const bookedAt = (b: Booking) => (b.bookedAt ? Date.parse(b.bookedAt) : Number(b.id.slice(1)) || 0);

/**
 * How much of the plan is used, measured for the week of `forDate` (monthly plans) or since the plan was bought (passes).
 * Real balances come from Arbox once connected; this keeps the demo honest in the meantime.
 */
export function planUsage(plan: PricingItem, bookings: Booking[], forDate: Date, planStart: string | null): PlanUsage {
  if (plan.billingType === "monthly") {
    const used = countInWeek(bookings, forDate);
    if (plan.perWeek === "unlimited") return { used, cap: null, left: Infinity, expired: false };
    const cap = plan.perWeek as number;
    return { used, cap, left: Math.max(0, cap - used), expired: false };
  }
  const cap = (plan.sessions ?? 0) + (siteConfig.flags.launchPricing ? (plan.bonusSessions ?? 0) : 0);
  const start = planStart ? Date.parse(planStart) : 0;
  // Only classes booked on this pass count, so buying a new pass starts from zero
  const used = bookings.filter((b) => bookedAt(b) >= start).length;
  const expired = forDate >= planEnd(plan, planStart);
  return { used, cap, left: expired ? 0 : Math.max(0, cap - used), expired };
}

function countInWeek(bookings: Booking[], d: Date) {
  const { start, end } = weekOf(d);
  return bookings.filter((b) => {
    const day = fromISO(b.date);
    return day >= start && day < end;
  }).length;
}
