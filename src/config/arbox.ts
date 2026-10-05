import { TODO } from "./site";

// Arbox is the booking/membership backend. Only public customer links belong here —
// never the Arbox management (staff) URL.
export const arbox = {
  publicBookingUrl: TODO,
  services: {
    reformer: TODO,
    mat: TODO,
    private: TODO,
    duo: TODO,
    women: TODO,
  } as Record<string, string>,
  memberships: {
    m1x: TODO,
    m2x: TODO,
    m3x: TODO,
    m4x: TODO,
    munl: TODO,
    p5: TODO,
    p10: TODO,
    p15: TODO,
  } as Record<string, string>,
};

export const hasPublicBooking = (url?: string) => !!url && url.startsWith("http");
