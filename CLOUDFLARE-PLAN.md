# re:set pilates on Cloudflare — game plan

How to publish the site securely and use Cloudflare's **free** plan to run more of the studio: forms, reminders, gift codes, links for flyers, email, and the Airtable connection.

Written 2026-10-12. Cloudflare changes its free limits from time to time, so check **cloudflare.com/plans** before relying on a number here.

---

## 0. Where things stand today (updated 2026-10-13)

**The site is live at https://resetpilates.org** on the re:set Cloudflare account (Resetpilates11@gmail.com's Account). `www.resetpilates.org` redirects there.

| Item | Status |
|---|---|
| Publishing | **Automatic.** Every push to `main` on GitHub `cdlvpflooring-prog/re-set-pilates` builds and publishes (`.github/workflows/ci.yml`, secret `CLOUDFLARE_API_TOKEN`). No commands on the Mac needed. The copy at `resetpilates11-source/Reset-Pilates-Website` is not what deploys; keep one of the two. |
| Lead form | **Live, tested end to end.** Website form → Worker `/api/lead` → Airtable *Leads & Inquiries* → Airtable automation emails resetpilates11@gmail.com. Turnstile bot check on; origin check, honeypot and rate limit behind it. |
| Flyer / QR links | Live: `resetpilates.org/go/book`, `/go/wa`, `/go/review`, `/go/map`, `/go/ig`, `/go/tiktok`, `/go/fb`, `/go/prices`, `/go/gift`, `/go/quiz`. `/go/wa` and `/go/review` go to the contact page until the WhatsApp number and Google review link are filled in `src/config/site.ts`. |
| Security (dashboard) | Done: SSL Full (strict) · Always Use HTTPS · minimum TLS 1.2 · TLS 1.3 · DNSSEC (pending the registrar's DS record, automatic) · Bot Fight Mode · Browser Integrity Check · managed WAF + DDoS (always on) · rate limit on `/api/*` (10 req / 10 s per visitor). |
| Security (code) | `public/_headers`: HSTS, Content-Security-Policy, no framing, camera/mic/location off. |
| Email | `hello@resetpilates.org` → resetpilates11@gmail.com via Email Routing. MX, SPF and DKIM records added. DMARC: see section 1. |
| Speed | Photos served as WebP at display size (3.6 MB → 0.7 MB). Hero video 1080p + 720p for phones. Cache rules in `_headers`. |
| Link previews / SEO | The Worker adds `<title>`, description, canonical, hreflang, Open Graph and Twitter tags per page and language, so WhatsApp/Instagram/Facebook/Google show the right text and the studio photo. Personal pages are `noindex`. `sitemap.xml` and `robots.txt` set for resetpilates.org. |
| Terminal | Node 24 (via nvm) and Bun are installed. Wrangler is logged in to the re:set account by OAuth. `~/.zshrc` still exports an old `CLOUDFLARE_API_TOKEN` (4 copies) that overrides that login: delete those lines, or run `unset CLOUDFLARE_API_TOKEN` before any `wrangler` command. |

## 1. What is still open

| # | Step | Who |
|---|---|---|
| 1 | **Google Search Console:** add property `resetpilates.org` (Domain type) → verify via "Cloudflare" one-click (or add the TXT record it shows) → submit `https://resetpilates.org/sitemap.xml`. | Owner (Google login) |
| 2 | **Google Business Profile:** paste the site link; once the profile is live, put the profile and review links into `social.googleBusiness` / `social.googleReview` in `src/config/site.ts` (that also switches on `/go/review`). | Owner → Claude |
| 3 | **Before announcing:** `flags.demoMode` off, `showUnapprovedPrices` off, WhatsApp number + phone in `siteConfig.contact`, real reviews in `config/team.ts` (or `showReviews` off). See `LAUNCH-CHECKLIST.md`. | Owner decides → Claude |
| 4 | **Web Analytics:** Cloudflare → Analytics & Logs → Web Analytics → add `resetpilates.org` (cookie-free, no banner needed). | Owner / Claude in Chrome |
| 5 | **DMARC** record if not yet present: `_dmarc` TXT `v=DMARC1; p=quarantine; rua=mailto:resetpilates11@gmail.com`. | Claude in Chrome |
| 6 | **Airtable alert:** remove the unused "Generate with AI" step from the "New lead → email Orit" automation so it does not spend AI credits per lead. | Owner (Airtable UI) |
| 7 | Later: Phase 4 items in section 5 (gift codes in D1, waitlist + reminders with Cron, Workers AI for "Ask Orit", R2 for the pro shoot, Access for a studio-only view). | Claude |

---

## 2. Phase 1: publish the site (about 20 minutes, dashboard only)

Use **Workers + GitHub** so that every push to `main` publishes on its own. Nobody has to run commands.

1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository**.
2. Connect GitHub and allow access to **only** `re-set-pilates`, not all repos.
3. Settings:
   - Project name: `re-set-pilates`
   - Production branch: `main`
   - Build command: `bun run build` (fallback: `npm install && npm run build`)
   - Deploy command: leave the default (`npx wrangler deploy`). It reads `wrangler.jsonc`.
4. **Save and deploy.** Then open the `workers.dev` link it gives you.
5. Turn on **preview URLs**, so every non-main branch gets its own test link. That lets Orit review a change before it goes live.
6. Check on a real iPhone and Android, in Hebrew and English. Open `/he/contact` directly to confirm direct links work.

Before real customers arrive: turn off `flags.demoMode`, and put the real domain in `public/robots.txt` (see `LAUNCH-CHECKLIST.md`).

## 3. Phase 2: security (all free)

### Already in the code (`public/_headers`)
- **HTTPS forced for a year** (HSTS). Browsers refuse a plain-HTTP version of the site.
- **Content Security Policy.** The page may only load our own files, Google Fonts, the Google Maps embed, Cloudflare Web Analytics and Turnstile. Injected scripts from anywhere else are blocked.
- **No framing** (`X-Frame-Options: DENY`), so other sites can't wrap ours to trick visitors.
- **Camera, microphone, location and payment APIs turned off.** The site doesn't use them.
- Tested locally: pages, fonts and the map all load with these rules in place.

> If you add a new outside service later (for example Google Analytics, a Meta pixel, Arbox widgets or a chat widget), add its address to the `Content-Security-Policy` line, or it will be blocked.

### Dashboard settings, once the domain is on Cloudflare
| Where | Setting |
|---|---|
| SSL/TLS → Overview | **Full (strict)** |
| SSL/TLS → Edge Certificates | Always Use HTTPS **on** · Minimum TLS **1.2** · TLS 1.3 **on** · Automatic HTTPS Rewrites **on** |
| DNS → Settings | **DNSSEC on** (then add the DS record at the registrar if it isn't Cloudflare) |
| Security → Bots | **Bot Fight Mode on** |
| Security → WAF → Managed rules | **Cloudflare Free Managed Ruleset on** |
| Security → WAF → Rate limiting | One free rule: max 10 requests a minute per visitor to `/api/*` (protects the form and relay from spam) |
| Security → Settings | Security level **Medium**, Browser Integrity Check **on** |
| Account → Members | Turn on **two-factor login** for every person with access. Give Orit her own login, never a shared password. |
| My Profile → API Tokens | One token per job (for example "Wrangler on Eli's Mac"), with only the permissions it needs. Delete tokens you stop using. |

### Turnstile (free, replaces CAPTCHA)
Add an invisible Turnstile check to the "call me back" form, checkout and gift card forms, so bots can't spam the studio's Airtable or inbox. The CSP already allows it. The site key goes in `src/config/site.ts`, and the secret key only in the Worker (section 5).

## 4. Phase 3: speed and insight (free)

- **Web Analytics** (Analytics & Logs → Web Analytics): visits, top pages and countries. It uses no cookies, so no cookie banner is needed. The CSP already allows it. Add it now; it costs nothing.
- **Speed → Optimization:** turn on Early Hints, HTTP/3, and Speed Brain (preloads the page a visitor is about to open).
- **Caching:** already set in `_headers`. The app shell is always fresh and photos are cached for a day. After the pro photo shoot, photos can move to R2 (section 5) and be cached for longer.
- **Zaraz** (free tag manager): if you want Google Analytics 4 or a Meta/Instagram pixel for ads, load them through Zaraz instead of adding their scripts to the site. The page stays fast and the CSP stays tight.

## 5. Phase 4: make the site do real work (Workers free tier)

One small Worker, `reset-api`, sits next to the site on the same domain under `/api/*`. It holds all the secrets (Airtable token, Turnstile secret), so they never reach visitors' browsers. Ordered by value to the studio:

| # | What | Cloudflare tool | What it solves (from `LAUNCH-CHECKLIST.md`) |
|---|---|---|---|
| 1 | **Lead form → Airtable** ✅ built | Worker + Turnstile (+ Airtable automation for the email to Orit) | Leads land in Airtable "Leads & Inquiries" and Orit gets an email. No more "opens your mail app" step. |
| 2 | **studio email address**: `hello@<domain>` → `resetpilates11@gmail.com` | **Email Routing** (free) | Professional address on the site and Google profile, while everything still arrives in the existing Gmail |
| 3 | **Flyer / QR short links** ✅ built: `/go/wa`, `/go/book`, `/go/review`, `/go/map`, `/go/ig` … | The Worker (targets live in `src/config/site.ts`) | Print a QR once and change where it points any time. Each link can count scans. |
| 4 | **Gift card codes** | **D1** database (free) + Worker | Unique code per gift, stored and redeemable, with an expiry date |
| 5 | **Waitlist + "remind me"** | D1 + **Cron Triggers** (scheduled Worker, free) | Every few minutes, check for freed spots and email or WhatsApp the next person |
| 6 | **Class reminders and a daily digest for Orit** | Cron Triggers + Email | Tomorrow's bookings and new leads, emailed at 7:00 each morning |
| 7 | **Checkout details saved** | Worker → Airtable "Members"/"Payments" | Names, phones and emails typed at checkout stop disappearing |
| 8 | **"Ask Orit" with real AI** | **Workers AI** (free daily allowance) or Claude via **AI Gateway** (free; adds caching, cost caps, logs) | Swap point is already in `src/content/chat.ts` → `answer()` |
| 9 | **Photos and video after the pro shoot** | **R2** (10 GB free, no download fees) + **Images** resizing | Big hero video and photos without slowing the site |
| 10 | **Private studio pages** (for example an Orit dashboard or the demo "Studio view") | **Cloudflare Access / Zero Trust** (free up to 50 users) | Only approved emails can open `/studio/*`, with a one-time code sent to their inbox. No password system to build. |

#1 and #3 are built. Next: **#2** (no code, 15 minutes), then 4–7, then 8–10 when the content is ready.

## 6. Timeline

| Week | Do | Who |
|---|---|---|
| 1 | Decide account + domain · Phase 1 publish on `workers.dev` · Web Analytics on | Eli (dashboard), Claude (checks) |
| 2 | Buy and connect domain · Phase 2 security table · Email Routing `hello@` · QR short links | Eli / Claude in Chrome |
| 3 | `reset-api` Worker: lead form → Airtable + email, with Turnstile · Rate-limit rule | Claude in this project |
| 4 | Gift codes (D1) · waitlist + reminders (Cron) · daily digest | Claude in this project |
| After the shoot | R2 photos/video · AI "Ask Orit" · Access-protected studio view | Claude in this project |

---

## 7. Three ways to get Claude to do this

| Way | Good for | Notes |
|---|---|---|
| **A. Claude Code (this app)** | Anything in the code: Workers, `_headers`, D1 tables, deploys | Uses `bunx wrangler` with your token, or the Cloudflare connector, which can already list Workers and create KV/D1 storage. Claude asks before publishing anything. |
| **B. Claude in Chrome** | Dashboard clicking: SSL settings, DNS, Email Routing, WAF, Redirect Rules, Analytics | Paste a phase from section 8. You log in yourself, and you approve each change. |
| **C. You, with this file** | Anything, at your own pace | Each table row is one setting. |

Rules for any Claude helper:
- **You** log in, type passwords, create API tokens and pay for domains. Claude never does those.
- Confirm the account name in the top-left of the dashboard before every change.
- Never paste a token or secret into chat. Secrets go into the dashboard (Worker → Settings → Variables → **Encrypt**) or into `~/.zshrc`.

## 8. Paste-ready instructions for Claude in Chrome

Open dash.cloudflare.com, log in, then paste **one block at a time**.

### Block 1: publish
```
You are helping set up the re:set pilates website on Cloudflare. I am logged in.
Goal: create a Worker that builds from GitHub repo cdlvpflooring-prog/re-set-pilates.
1. Tell me the account name shown in the dashboard and wait for me to confirm it.
2. Go to Workers & Pages → Create → Import a repository.
3. If GitHub needs connecting, stop and let me do the authorization. Only allow the re-set-pilates repo.
4. Project name re-set-pilates, production branch main, build command "bun run build", deploy command default.
5. Before clicking the final Deploy button, show me a summary and wait for my "yes".
6. After the deploy, open the workers.dev link and tell me whether the home page and /he/contact load.
Do not change anything else. Do not create API tokens or enter passwords.
```

### Block 2: security (after the domain is added to Cloudflare)
```
On the zone resetpilates.org, check and report the current value of each setting below, then
list what you would change and wait for my "yes" before changing anything:
- SSL/TLS mode → Full (strict)
- Always Use HTTPS on, Minimum TLS 1.2, TLS 1.3 on, Automatic HTTPS Rewrites on
- DNSSEC on (tell me the DS record if the registrar is not Cloudflare)
- Bot Fight Mode on
- WAF: Cloudflare Free Managed Ruleset on
- Security level Medium, Browser Integrity Check on
- Speed: Early Hints on, HTTP/3 on, Speed Brain on
- Web Analytics on for this site
```

### Block 3: studio email
```
On zone resetpilates.org, open Email → Email Routing.
Set up hello@resetpilates.org to forward to resetpilates11@gmail.com.
Cloudflare will send a verification email to that Gmail; tell me when to go click it.
Let Cloudflare add its MX and SPF DNS records. Show me the records before saving.
Also add a DMARC TXT record: _dmarc  "v=DMARC1; p=quarantine; rua=mailto:resetpilates11@gmail.com"
```

### Block 4: connect the domain to the site
```
On the re:set Cloudflare account, open Workers & Pages → re-set-pilates → Settings → Domains & Routes.
Add custom domains resetpilates.org and www.resetpilates.org. Show me what you will add and wait for my "yes".
Then go to the resetpilates.org zone → Rules → Redirect Rules → Create from template "Redirect from WWW to root".
Show me the rule before deploying it. Finally open https://www.resetpilates.org and tell me where it lands.
```

### Block 5: rate limit (after the `/api` Worker exists)
```
On zone resetpilates.org, Security → WAF → Rate limiting rules: create one rule
"api-protect": requests to URI path starting with /api/, more than 10 per 1 minute per IP → Block for 1 minute.
Show me the rule before deploying it.
```

## 9. Terminal cheat sheet (Mac)

Bun is already installed and is now on the terminal PATH. **Open a new terminal tab** first.

```bash
bunx wrangler whoami                 # shows the Cloudflare account the token reaches
bun run build                        # builds the site into ./dist
bunx wrangler deploy                 # publishes manually (normally GitHub does it)
bunx wrangler secret put AIRTABLE_TOKEN   # stores a secret in a Worker; paste at the hidden prompt
```

Clean-up still needed in `~/.zshrc`: keep **one** `export CLOUDFLARE_API_TOKEN=...` line and delete the others and the line containing `read -rs` (`open -e ~/.zshrc`).

Hidden prompts (passwords, tokens) show **nothing** while you paste. That's normal: paste once and press Enter. Never run them with `!` in the Claude chat box, because that can't take typed input.
