# RE:SET Pilates — website + installable app (PWA)

One Vite + React + TypeScript codebase: bilingual (Hebrew default, RTL / English) marketing site and
member booking flow. Desktop gets an editorial top-nav layout; phones get the app shell with the floating tab bar.

## Run

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production build in dist/
```

## Where things live

- `src/config/` — business data: `site.ts` (contact, flags, media slots), `arbox.ts`, `services.ts`, `pricing.ts`, `team.ts`
- `src/content/he.ts`, `en.ts` — all copy (same shape; `en.ts` defines the type)
- `src/lib/booking.ts` — booking adapter. `mockProvider` serves a sample schedule; replace with an Arbox provider
- `src/lib/store.tsx` — local member/bookings state (localStorage) until a real backend exists
- `src/styles/global.css` — design tokens, tones (`.tone-dark` / `.tone-light`), motion
- `.versions/` — saved copies of each design round (`v1-dark` is live; `v2-light` is the light, line-art redesign). To switch, copy that folder's `src`, `index.html` and `manifest.webmanifest` back into place.

## Before launch (search for `TODO_VERIFY`)

- Phone, WhatsApp, hours, parking, public address, cancellation policy
- Arbox public booking URLs / API; Mat capacity
- Prices: every item is `approved: false`; set `flags.showUnapprovedPrices` to `false` to hide them
- Founder + instructor names, bios, portraits (`config/team.ts`); real reviews/press
- Real studio photography and hero video (`siteConfig.studioMedia`)
- Payment provider (checkout and gift cards are demo-only), lead form destination, GA4 id
- Turn off `flags.demoMode`; set the production domain in `public/robots.txt`

Onboarding screen shows once when installed to the home screen (or with `?welcome` in the URL).
