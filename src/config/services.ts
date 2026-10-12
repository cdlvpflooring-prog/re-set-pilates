export type ServiceId = "reformer" | "mat" | "private" | "duo" | "women";

export interface ServiceConfig {
  id: ServiceId;
  slug: string;
  image: string; // photo slot — generated stand-in until the pro shoot; set a real path after
  pos: string; // object-position
  thumb: string; // small square-ish exercise photo for tabs, class cards and headers
  thumbPos?: string;
  bookable: boolean; // bookable in the schedule vs. by request
  capacity?: number;
  minutes: number;
  approved: boolean; // launch-approved to present as bookable
}

export const services: ServiceConfig[] = [
  { id: "reformer", slug: "reformer-groups", image: "/assets/ex-group.jpg", pos: "50% 45%", thumb: "/assets/ex-tab-reformer.jpg", thumbPos: "50% 60%", bookable: true, capacity: 5, minutes: 50, approved: true },
  { id: "mat", slug: "mat-pilates", image: "/assets/ex-mat.jpg", pos: "50% 55%", thumb: "/assets/ex-tab-mat.jpg", thumbPos: "50% 45%", bookable: true, minutes: 50, approved: true },
  { id: "private", slug: "private-1to1", image: "/assets/ex-private.jpg", pos: "50% 45%", thumb: "/assets/ex-private.jpg", thumbPos: "60% 40%", bookable: false, minutes: 50, approved: true },
  { id: "duo", slug: "duo", image: "/assets/ex-duo.jpg", pos: "50% 40%", thumb: "/assets/ex-duo.jpg", thumbPos: "50% 35%", bookable: false, minutes: 50, approved: true },
  { id: "women", slug: "women-only", image: "/assets/ex-women.jpg", pos: "50% 40%", thumb: "/assets/ex-women.jpg", thumbPos: "70% 40%", bookable: false, minutes: 50, approved: false },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
