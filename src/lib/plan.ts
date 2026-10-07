import type { PricingItem } from "../config/pricing";
import { siteConfig } from "../config/site";
import { fromISO } from "./booking";
import type { Booking } from "./store";

export interface PlanUsage {
  /** Classes already booked in the period that counts (this week for monthly plans, since purchase for passes). */
  used: number;
  /** Classes allowed in that period; null = unlimited. */
  cap: number | null;
  /** Classes still available; Infinity when unlimited. */
  left: number;
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

/**
 * How much of the plan is used, measured for the week of `forDate` (monthly plans) or since purchase (passes).
 * Real balances come from Arbox once connected; this keeps the demo honest in the meantime.
 */
export function planUsage(plan: PricingItem, bookings: Booking[], forDate: Date, memberSince: string | null): PlanUsage {
  if (plan.billingType === "monthly") {
    if (plan.perWeek === "unlimited") return { used: countInWeek(bookings, forDate), cap: null, left: Infinity };
    const cap = plan.perWeek as number;
    const used = countInWeek(bookings, forDate);
    return { used, cap, left: Math.max(0, cap - used) };
  }
  const cap = (plan.sessions ?? 0) + (siteConfig.flags.launchPricing ? (plan.bonusSessions ?? 0) : 0);
  const since = memberSince ? new Date(memberSince) : null;
  const used = bookings.filter((b) => !since || fromISO(b.date) >= new Date(since.toDateString())).length;
  return { used, cap, left: Math.max(0, cap - used) };
}

function countInWeek(bookings: Booking[], d: Date) {
  const { start, end } = weekOf(d);
  return bookings.filter((b) => {
    const day = fromISO(b.date);
    return day >= start && day < end;
  }).length;
}
