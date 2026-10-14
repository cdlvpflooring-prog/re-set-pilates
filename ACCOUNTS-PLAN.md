# Accounts and sign-in on Cloudflare

Decision (owner, 14 Oct 2026): build sign-in on Cloudflare, where the site already runs, instead of Supabase.

## What gets built

| Piece | Cloudflare product | Notes |
|---|---|---|
| Accounts, sessions, profiles | **D1** (Cloudflare's SQL database) bound to the existing Worker | Free tier is far above a studio's needs |
| Login code | **Better Auth** (open-source library) running in the Worker | Battle-tested login code instead of hand-written security code |
| Google sign-in | Better Auth Google provider | Needs a Google Cloud OAuth client (owner creates it; Claude gives steps) |
| Email magic link | Better Auth magic-link plugin + **Cloudflare Email Service** to send | Needs the studio's own domain on Cloudflare (e.g. resetpilates.co.il) |
| WhatsApp code | Better Auth phone-number plugin; codes sent through the **WhatsApp Business Cloud API** (Meta) | Needs the studio's new WhatsApp number registered as a Business number; Meta charges a small fee per code |
| AI trainer data | D1 tables (check-ins, baselines, goals) | Health data stays in D1 and the Orit-only Airtable base, never in the main base |
| Sync to Airtable | The existing relay: on sign-up, the account is linked to the Members row by phone | Airtable stays the studio's view; D1 is what the app logs in against |

## Order of work

1. **D1 + Better Auth + email magic link.** Needs a domain on Cloudflare.
2. **Google sign-in.** Needs the Google OAuth client ID and secret, stored as Cloudflare secrets.
3. **Profile after purchase.** Moves the AI trainer onboarding (branch `claude/pilates-ai-trainer-spec-17cbc0`) from browser storage to D1.
4. **WhatsApp code and WhatsApp alerts to Orit.** Needs the WhatsApp Business number and a Meta app.

## Needed from the owner

- [ ] The studio's domain name, and whether it's already on Cloudflare
- [ ] A Google Cloud project for the OAuth client (step-by-step guide to follow)
- [ ] The new WhatsApp number, registered with WhatsApp Business (Meta Business account)
- [ ] Lawyer-approved privacy policy covering accounts, health data and marketing consent
