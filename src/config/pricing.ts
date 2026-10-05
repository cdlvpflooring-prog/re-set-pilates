import { arbox } from "./arbox";

export interface PricingItem {
  id: string;
  billingType: "monthly" | "pass";
  perWeek?: number | "unlimited";
  sessions?: number;
  price: number;
  launchPrice?: number; // monthly launch overlay
  bonusSessions?: number; // pass launch overlay (+1)
  currency: "ILS";
  popular?: boolean;
  validityMonths: number;
  arboxUrl: string;
  active: boolean;
  approved: boolean; // false => shown with a "pending approval" note (or hidden)
}

export const pricing: { memberships: PricingItem[]; passes: PricingItem[] } = {
  memberships: [
    { id: "m1x", billingType: "monthly", perWeek: 1, price: 240, launchPrice: 220, currency: "ILS", validityMonths: 1, arboxUrl: arbox.memberships.m1x, active: true, approved: true },
    { id: "m2x", billingType: "monthly", perWeek: 2, price: 460, launchPrice: 430, currency: "ILS", validityMonths: 1, arboxUrl: arbox.memberships.m2x, active: true, approved: true },
    { id: "m3x", billingType: "monthly", perWeek: 3, price: 630, launchPrice: 590, currency: "ILS", validityMonths: 1, popular: true, arboxUrl: arbox.memberships.m3x, active: true, approved: true },
    { id: "m4x", billingType: "monthly", perWeek: 4, price: 800, launchPrice: 750, currency: "ILS", validityMonths: 1, arboxUrl: arbox.memberships.m4x, active: true, approved: true },
    { id: "munl", billingType: "monthly", perWeek: "unlimited", price: 990, launchPrice: 920, currency: "ILS", validityMonths: 1, arboxUrl: arbox.memberships.munl, active: true, approved: true },
  ],
  passes: [
    { id: "p5", billingType: "pass", sessions: 5, price: 300, bonusSessions: 1, currency: "ILS", validityMonths: 2, arboxUrl: arbox.memberships.p5, active: true, approved: true },
    { id: "p10", billingType: "pass", sessions: 10, price: 550, bonusSessions: 1, currency: "ILS", validityMonths: 2, popular: true, arboxUrl: arbox.memberships.p10, active: true, approved: true },
    { id: "p15", billingType: "pass", sessions: 15, price: 750, bonusSessions: 1, currency: "ILS", validityMonths: 2, arboxUrl: arbox.memberships.p15, active: true, approved: true },
  ],
};

export const allPlans = [...pricing.memberships, ...pricing.passes];
export const planById = (id: string) => allPlans.find((p) => p.id === id);
