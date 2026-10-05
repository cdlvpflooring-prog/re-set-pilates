export type ServiceId = "reformer" | "mat" | "private" | "duo" | "women";

export interface ServiceConfig {
  id: ServiceId;
  slug: string;
  image: string; // photo slot — empty shows line art; set a path after the shoot
  pos: string; // object-position
  bookable: boolean; // bookable in the schedule vs. by request
  capacity?: number;
  minutes: number;
  approved: boolean; // launch-approved to present as bookable
}

export const services: ServiceConfig[] = [
  { id: "reformer", slug: "reformer-groups", image: "/assets/studio.jpg", pos: "50% 62%", bookable: true, capacity: 5, minutes: 50, approved: true },
  { id: "mat", slug: "mat-pilates", image: "/assets/mat-flyer.jpg", pos: "50% 30%", bookable: true, minutes: 50, approved: true },
  { id: "private", slug: "private-1to1", image: "/assets/reformer-poster.jpg", pos: "50% 22%", bookable: false, minutes: 50, approved: true },
  { id: "duo", slug: "duo", image: "/assets/reformer-poster.jpg", pos: "50% 62%", bookable: false, minutes: 50, approved: true },
  { id: "women", slug: "women-only", image: "/assets/studio.jpg", pos: "18% 50%", bookable: false, minutes: 50, approved: false },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
