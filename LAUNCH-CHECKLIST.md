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
- The "call me back" form opens a ready-to-send email to that Gmail in the visitor's mail app. To receive leads silently (no email app step), connect a form service such as Formspree or EmailJS to the same Gmail.
- Google Business Profile: create/claim the listing, then paste the profile link and the review link into `social.googleBusiness` and `social.googleReview`.
- The three Google reviews on the home page are labelled samples (demo mode only). Replace them with real reviews in `src/config/team.ts`.
- WhatsApp, phone and parking details are still "to be confirmed".

## Content placeholders (planned for the next version)
- Studio photos and hero video (after construction and the professional shoot).
- Instructor names, bios and portraits; fuller founder bio and background story.
- Reviews and press (hidden until real ones exist).

## Before going live
- A web address and hosting, set up so page links work when opened directly.
- Turn off demo mode (`flags.demoMode`) and confirm launch pricing on/off.
- Google Analytics ID, sitemap, and the real domain in `public/robots.txt`.
- Check on a real iPhone and Android phone, in Hebrew and English.
