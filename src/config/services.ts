export type ServiceId = "reformer" | "mat" | "private" | "duo" | "women" | "teens" | "groups";

export interface ServiceConfig {
  id: ServiceId;
  slug: string;
  image: string; // photo slot — generated stand-in until the pro shoot; set a real path after
  pos: string; // object-position
  thumb: string; // 240px square-ish exercise photo for tabs and class cards (ex-*-sm.jpg)
  thumbPos?: string;
  bookable: boolean; // bookable in the schedule vs. by request
  capacity?: number;
  minutes: number;
  approved: boolean; // launch-approved to present as bookable
}

export const services: ServiceConfig[] = [
  { id: "reformer", slug: "reformer-groups", image: "/assets/ex-group.webp", pos: "50% 45%", thumb: "/assets/ex-tab-reformer-sm.webp", thumbPos: "50% 60%", bookable: true, capacity: 5, minutes: 55, approved: true },
  { id: "mat", slug: "mat-pilates", image: "/assets/ex-mat.webp", pos: "50% 55%", thumb: "/assets/ex-tab-mat-sm.webp", thumbPos: "50% 45%", bookable: false, minutes: 55, approved: true }, // by request until Mat instructors join (then true + slots in lib/booking.ts)
  { id: "private", slug: "private-1to1", image: "/assets/ex-private.webp", pos: "50% 45%", thumb: "/assets/ex-private-sm.webp", thumbPos: "60% 40%", bookable: false, minutes: 55, approved: true },
  { id: "duo", slug: "duo", image: "/assets/ex-duo.webp", pos: "50% 40%", thumb: "/assets/ex-duo-sm.webp", thumbPos: "50% 35%", bookable: false, minutes: 55, approved: true },
  { id: "women", slug: "women-only", image: "/assets/ex-women.webp", pos: "50% 40%", thumb: "/assets/ex-women-sm.webp", thumbPos: "70% 40%", bookable: false, minutes: 55, approved: false },
  // Teens (girls 12-17): a fixed weekly group, sold as its own monthly plan (pricing.ts: "teens"). Photo is a stand-in until the shoot.
  { id: "teens", slug: "teens", image: "/assets/ex-rest.webp", pos: "50% 40%", thumb: "/assets/ex-tab-reformer-sm.webp", thumbPos: "50% 60%", bookable: false, capacity: 5, minutes: 55, approved: true },
  // Closed groups: the studio closes for your group. Two packages (packages.ts): private group and event.
  { id: "groups", slug: "closed-groups", image: "/assets/studio.webp", pos: "50% 60%", thumb: "/assets/ex-tab-reformer-sm.webp", thumbPos: "50% 60%", bookable: false, capacity: 5, minutes: 55, approved: true },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
