# re:set pilates — what is not finished end to end

Everything below works on screen as a demo. This is what each flow still needs before real customers use it.

## Scheduling and booking
- Class times and "spots left" are sample data. Needs the Arbox public link / API so real classes and availability show.
- A booking is saved only in the visitor's own browser. It does not reach Arbox, so the studio never sees it. Needs the Arbox hand-off (the button is ready: fill `publicBookingUrl` in `src/config/arbox.ts`).
- Cancelling removes the class on screen only. Needs the Arbox cancellation call and the real cancellation policy text.
- Bed choice is a preference only; Arbox does not reserve a specific bed.
- Membership limits (for example 3 classes a week) and pass balances are not enforced; the numbers on the profile are estimates.
- Waitlist and "remind me" are switches only. Nobody is notified. Needs Arbox waitlist or a messaging service (WhatsApp / SMS / email).
- There is no sign-in. "Maya Levi" is a demo member. Needs real accounts (Arbox login or phone-code login).

## Checkout (memberships and passes)
- The three payment buttons (Arbox, Bit, card) have no links yet, so choosing one completes a demo purchase with no charge. Needs the real links in `src/config/site.ts` (`payments`) and the per-plan Arbox links in `src/config/arbox.ts`.
- After real payment, something must tell the app the plan is active (Arbox membership status). Today the plan turns on as soon as a button is pressed.
- Name, phone and email typed at checkout are not saved or sent anywhere.
- No receipt or confirmation message is sent.

## Gift cards
- No payment is taken and nothing is sent to the recipient.
- No gift code is created, so a gift cannot be redeemed.
- To make it real: (1) a payment link, (2) a unique code per gift stored somewhere the studio can see (Arbox coupon, or a simple sheet/database), (3) delivery to the recipient by WhatsApp or email with the note, (4) a way to redeem the code at checkout or at the desk, (5) an expiry rule.
- "Notify me" for the shop saves nothing.

## Contact and leads
- Main contact is resetpilates11@gmail.com (set in `src/config/site.ts`).
- The "call me back" form sends straight into Airtable (Leads & Inquiries) through the Cloudflare Worker once `AIRTABLE_TOKEN` is set on the Worker. Until then, or if sending fails, it opens a ready-to-send email to that Gmail as before. Steps: `CLOUDFLARE-PLAN.md` section 1.
- Google Business Profile: create/claim the listing, then paste the profile link and the review link into `social.googleBusiness` and `social.googleReview`.
- The three Google reviews on the home page are labelled samples (demo mode only). Replace them with real reviews in `src/config/team.ts`.
- WhatsApp, phone and parking details are still "to be confirmed".

## Content placeholders (planned for the next version)
- Studio photos and hero video (after construction and the professional shoot).
- Instructor names, bios and portraits; fuller founder bio and background story.
- Reviews and press (hidden until real ones exist).

## Before going live
- Live at https://resetpilates.org (Cloudflare, auto-published from `main`). Open items: `CLOUDFLARE-PLAN.md` section 1.
- Turn off demo mode (`flags.demoMode`) and confirm launch pricing on/off.
- New offers (Oct 2026 flyers): add a "Teens" plan in Airtable *Plans & Prices* with Website ID `teens`, regular price 180, monthly, validity 1 month, or the teens checkout returns "unknown plan". Reformer and Mat share one price list; the chosen class is written into the membership name, e.g. "2× per week (Mat)". Group packages (private group 350, event 750) are request-only and arrive as leads with interest "Event" and the package in the message. Arbox links for `teens` / `groups` are still TODO in `src/config/arbox.ts`.
- Photos for Teens and Closed groups are stand-ins (`ex-rest`, `studio`) until the shoot.
- Google Analytics ID (or Cloudflare Web Analytics). Sitemap and `robots.txt` are set for `resetpilates.org`.
- Check on a real iPhone and Android phone, in Hebrew and English.

## My progress (AI trainer MVP, spec in `AI-TRAINER-SPEC.md`)
- Works as a demo only: answers, check-ins and progress live in the visitor's own browser. Needs sign-in and a private server database (health data encrypted, seen only by the member and her instructor) before real use.
- Attendance comes from sample data plus the visitor's own demo bookings. Needs Arbox attendance sync.
- Safety reviews (pain 7+, rising pain, high soreness, onboarding red flags) show in a demo "Studio view" inside Details. Needs a real staff screen and a notification to Orit (WhatsApp / email) that retries until she acknowledges.
- Orit must approve: health-consent wording, the "stop and see a doctor" wording, all thresholds and score targets in `src/config/trainer.ts`, whether clients may self-test at home, and who covers safety reviews when she is away.
- Included resources are sample titles with no content. Supply real videos/guides and set `approved: true`.
- Personal paid suggestions are switched off (`paidCards.enabled: false`) until Arbox catalog and membership data are connected; members who opt in see a plain link to the price list.
- Not built yet (phase 2 in the spec): spring/level progression graph, re-assessment radar chart, trainer level-ups, AI-written recaps and load suggestions, nutrition.

## Receipts (invoice + receipt after every purchase)

Built: every membership, pass and gift card purchase makes a receipt (number `RS-YYMMDD-XXXX`) with the logo and studio contact details. It is saved in the app (Profile → Purchases & receipts, plus a notification card), has a private printable link (`/r/…`, encrypted), and is sent automatically on whichever channels are set up below. Unused classes move to the new plan, and the same running monthly membership can't be bought twice.

To switch on each channel (any channel left unset is simply skipped):
- [ ] **Business details on the receipt**: fill `business.legalName` and `business.taxId` (עוסק number) in `src/config/site.ts`. Receipts show only the email; the WhatsApp number appears once `contact.whatsapp` is filled (no social handles or address).
- [ ] **Email**: in Cloudflare → Email → Email Sending, onboard `resetpilates.org` (adds DNS records), then uncomment `"send_email"` in `wrangler.jsonc`. Sends from `receipts@resetpilates.org`, replies go to the Gmail, and the Gmail gets a copy of every receipt.
- [ ] **WhatsApp** (new studio number): WhatsApp Business Cloud API. Create and get approved a template (Hebrew + English) with body parameters {{1}} first name, {{2}} receipt number, {{3}} total, {{4}} receipt link. Then add Worker secrets `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` and `WHATSAPP_RECEIPT_TEMPLATE` (the template name).
- [ ] **SMS** (only used when WhatsApp is not set up): Twilio secrets `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`.
- [ ] Optional: a separate `RECEIPT_SECRET` for the receipt links (otherwise the Turnstile secret is used; changing it breaks old links).
- [ ] Legal: this is a purchase confirmation. The official tax invoice/receipt (חשבונית מס / קבלה) must come from the payment or accounting system (Arbox, Green Invoice, etc.) once connected.
