// Single source of truth for business data. Anything TODO_VERIFY is unresolved
// business data, not design — never hard-code these values inside components.
export const TODO = "TODO_VERIFY";
export const isTodo = (v?: string) => !v || v.startsWith(TODO);

export const siteConfig = {
  brand: {
    name: "re:set pilates",
    tagline: "Reset Your Strength",
    supportingLine: "Strong body · Calm mind · Happier you",
  },
  locale: { default: "he", supported: ["he", "en"] as const },
  capacity: { reformerBeds: 5, maxGroupSize: 5 },
  social: {
    instagram: "https://www.instagram.com/resetpilates_/",
    tiktok: "https://www.tiktok.com/@reset.pilates",
    facebook: "https://www.facebook.com/profile.php?id=61595012095305",
    instagramHandle: "@resetpilates_",
    // Google Business Profile: paste the profile link and the "Ask for reviews" link once the listing is live
    googleBusiness: TODO,
    googleReview: TODO,
    // Google Place ID (from the profile, starts with "ChIJ"). Once set, directions and the map open the listing itself.
    googlePlaceId: TODO,
    tiktokHandle: "@reset.pilates",
  },
  contact: {
    phone: TODO,
    whatsapp: TODO, // international digits only, e.g. 9725XXXXXXXX
    email: "resetpilates11@gmail.com", // main customer contact — all important communication goes here
    streetHe: "גזית 1",
    streetEn: "Gazit 1",
    cityHe: "הוד השרון",
    cityEn: "Hod Hasharon",
    publicAddress: "TODO_VERIFY_PUBLIC_ADDRESS",
    mapsQuery: "Gazit 1, Hod Hasharon, Israel",
    geo: { lat: 32.1506, lng: 34.8888 }, // approximate — TODO_VERIFY
    geoVerified: false, // set true once lat/lng match the pin on the Google profile; only then is it published in the schema
    postalCode: TODO,
    hours: TODO,
    // Structured opening hours for Google (schema). Must match the Google Business Profile exactly.
    // Days: Su Mo Tu We Th Fr Sa. Example: { days: ["Su", "Mo", "Tu", "We", "Th"], opens: "07:00", closes: "21:00" }
    openingHours: [] as { days: ("Su" | "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa")[]; opens: string; closes: string }[],
    parking: TODO,
  },
  // Feature flags
  policies: {
    cancelHours: 24, // cancel at least this many hours before class to get the session back
    pregnancyUpTo: TODO, // e.g. "week 30" — Orit to confirm
  },
  flags: {
    // Launch pricing overlay (never overwrites the core pricing model).
    launchPricing: true,
    // Prototype: show unapproved prices with a "pending approval" marker.
    showUnapprovedPrices: true,
    // Prototype: member/visitor switch on the profile screen. Remove in production.
    demoMode: true,
    // Real reviews/press only; hidden until verified entries exist.
    showReviews: true,
  },
  // Payment options offered at the end of checkout. Add the real links; a method
  // without a link completes as a demo so the flow can still be reviewed.
  payments: [
    { id: "arbox", url: TODO },
    { id: "bit", url: TODO },
    { id: "card", url: TODO },
  ] as { id: "arbox" | "bit" | "card"; url: string }[],
  analytics: { ga4MeasurementId: TODO },
  studioMedia: {
    heroVideo: "", // e.g. "/media/hero.mp4" — drop in real footage; poster is used until then
    heroPoster: "/assets/studio-wide.jpg", // the re:set studio render; replace with the real photo after the shoot
    ogImage: "/assets/studio.jpg",
    logoDisc: "/assets/logo-gold-ring.jpg",
    music: "", // optional user-uploaded track; never autoplays
  },
};

/** Google Maps link: opens the Google listing once the Place ID is set, the address until then. */
export function mapsLink() {
  const c = siteConfig.contact;
  const q = isTodo(siteConfig.social.googleBusiness) ? c.mapsQuery : `${siteConfig.brand.name}, ${c.mapsQuery}`;
  const place = isTodo(siteConfig.social.googlePlaceId) ? "" : `&query_place_id=${siteConfig.social.googlePlaceId}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}${place}`;
}

/** Keyless Google Maps embed. Searches the business name once the profile is live so the pin shows the listing. */
export function mapsEmbedSrc(lang: string) {
  const c = siteConfig.contact;
  const q = isTodo(siteConfig.social.googleBusiness) ? c.mapsQuery : `${siteConfig.brand.name}, ${c.mapsQuery}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=${lang}&z=17&output=embed`;
}

export type Lang = (typeof siteConfig.locale.supported)[number];
