# re:set pilates on Cloudflare — game plan

How to publish the site securely and use Cloudflare's **free** plan to run more of the studio: forms, reminders, gift codes, links for flyers, email, and the Airtable connection.

Written 2026-10-12. Cloudflare changes its free limits from time to time, so check **cloudflare.com/plans** before relying on a number here.

---

## 0. Where things stand today

| Item | Status |
|---|---|
| Site code | On GitHub: `cdlvpflooring-prog/re-set-pilates` (public), branch `main` |
| Cloudflare settings in the code | Done. `wrangler.jsonc` publishes `./dist`, and direct links like `/he/schedule` work. `public/_headers` now adds security headers (see section 3). |
| Cloudflare account | The connected account already runs `cdlvp-site`. **The re:set site is not on Cloudflare yet.** No storage (KV, D1) is set up, and R2 file storage is switched off. |
| Domain | Not bought or chosen yet (`robots.txt` still says `TODO_VERIFY_DOMAIN`) |
| Terminal | Node is not installed, but **Bun is**, and Bun can run Wrangler. Use `bunx wrangler …` wherever guides say `npx wrangler …`. The token is in `~/.zshrc` (clean up the duplicate lines, see section 9). |
| Airtable | "Reset Pilates" base is built. Nothing on the site writes to it yet. That needs the Worker relay in section 5. |

## 1. Two decisions before starting

1. **Which Cloudflare account?** Either use the existing account (simplest: one login and one bill, next to `cdlvp-site`), or open a separate account for re:set with `resetpilates11@gmail.com`. A separate account is cleaner if the studio could ever be sold or handed to Orit to run alone. You can always invite the other login as a member later.
2. **Which domain?** For example `resetpilates.co.il` (Israeli, from an Israeli registrar) or `resetpilates.com` (Cloudflare Registrar sells `.com` at cost, without the usual markup). Until a domain exists, the site runs at a free `re-set-pilates.<account>.workers.dev` address, which is fine for a soft launch and for testing on phones.

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
| 1 | **Lead form → Airtable + email to Orit** | Worker + Turnstile + Email Routing "send email" | Leads land in Airtable "Leads & Inquiries" and Orit gets an email. No more "opens your mail app" step. |
| 2 | **studio email address**: `hello@<domain>` → `resetpilates11@gmail.com` | **Email Routing** (free) | Professional address on the site and Google profile, while everything still arrives in the existing Gmail |
| 3 | **Flyer / QR short links**: `/wa`, `/book`, `/review`, `/map`, `/ig` | **Redirect Rules** (free) or the Worker | Print a QR once and change where it points any time. Each link can count scans. |
| 4 | **Gift card codes** | **D1** database (free) + Worker | Unique code per gift, stored and redeemable, with an expiry date |
| 5 | **Waitlist + "remind me"** | D1 + **Cron Triggers** (scheduled Worker, free) | Every few minutes, check for freed spots and email or WhatsApp the next person |
| 6 | **Class reminders and a daily digest for Orit** | Cron Triggers + Email | Tomorrow's bookings and new leads, emailed at 7:00 each morning |
| 7 | **Checkout details saved** | Worker → Airtable "Members"/"Payments" | Names, phones and emails typed at checkout stop disappearing |
| 8 | **"Ask Orit" with real AI** | **Workers AI** (free daily allowance) or Claude via **AI Gateway** (free; adds caching, cost caps, logs) | Swap point is already in `src/content/chat.ts` → `answer()` |
| 9 | **Photos and video after the pro shoot** | **R2** (10 GB free, no download fees) + **Images** resizing | Big hero video and photos without slowing the site |
| 10 | **Private studio pages** (for example an Orit dashboard or the demo "Studio view") | **Cloudflare Access / Zero Trust** (free up to 50 users) | Only approved emails can open `/studio/*`, with a one-time code sent to their inbox. No password system to build. |

Order to build: **#2 and #3 first** (no code, 15 minutes each), then **#1** (one Worker, unlocks everything else), then 4–7, then 8–10 when the content is ready.

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
On the zone <DOMAIN>, check and report the current value of each setting below, then
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
On zone <DOMAIN>, open Email → Email Routing.
Set up hello@<DOMAIN> to forward to resetpilates11@gmail.com.
Cloudflare will send a verification email to that Gmail; tell me when to go click it.
Let Cloudflare add its MX and SPF DNS records. Show me the records before saving.
Also add a DMARC TXT record: _dmarc  "v=DMARC1; p=quarantine; rua=mailto:resetpilates11@gmail.com"
```

### Block 4: QR short links
```
On zone <DOMAIN>, go to Rules → Redirect Rules and create these (302, keep query string off):
/wa      → <WhatsApp link, I will give it>
/book    → https://<DOMAIN>/he/schedule
/review  → <Google review link, I will give it>
/map     → <Google Maps link>
/ig      → <Instagram profile>
Show me the list before saving. If the free plan limit stops you, tell me how many fit.
```

### Block 5: rate limit (after the `/api` Worker exists)
```
On zone <DOMAIN>, Security → WAF → Rate limiting rules: create one rule
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
