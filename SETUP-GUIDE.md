# Setup guide: website ↔ Airtable

Click-by-click steps that only the owner can do. Everything else is already in the code.

## 1. Turn on the relay (Cloudflare, ~5 minutes)

The website now sends every form (lead, checkout, booking, cancel, waitlist, gift card, quiz, chat) to `/api/…`. That address is handled by the same Cloudflare Worker that serves the site (`worker/index.ts`). It writes to Airtable using a key that only Cloudflare knows.

1. **Make a fresh Airtable key.** Go to airtable.com/create/tokens and sign in as **re:set**. Create a token named `re:set website` with:
   - Scopes: `data.records:read` and `data.records:write` only
   - Access: the **Reset Pilates** base only
   - Copy the token. It is shown once.
2. **Give it to Cloudflare.** In the Cloudflare dashboard, open **Workers & Pages → re-set-pilates → Settings → Variables and Secrets → Add**:
   - Type: **Secret**
   - Name: `AIRTABLE_TOKEN`
   - Value: paste the token, then **Deploy**.
3. **Check the build settings** under **Settings → Build**:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
4. Merge this branch into `main`. Cloudflare builds and deploys it automatically.
5. **Test it.** On the live site, send the "Want us to call you?" form with your own details. Within a few seconds you should see a new row in Airtable under **Leads & Inquiries**, linked to a **Members** row.
   - If no row appears, open **Workers & Pages → re-set-pilates → Observability** and look for a `relay failed` line. It shows what Airtable answered.

Never paste the token into the code, a chat or an email. If it leaks, delete it at airtable.com/create/tokens and repeat steps 1–2.

**What the relay does on its own:**
- Matches people by phone number, so `+972 50…` and `050-…` count as the same person.
- Only fills empty fields, so it never overwrites what Orit typed.
- Takes prices from **Plans & Prices**, never from the browser.
- Saves every purchase as **Pending**.
- Applies the 24-hour cancellation rule from the class time.
- Rejects requests from other websites, rate-limits each visitor and filters bots with a hidden field.
- Keeps a form for later and resends it when a phone is offline.

## 2. Alerts to the studio (Airtable automations)

Open the base → **Automations → Create automation**. Make one per row:

| Name | Trigger | Action |
|---|---|---|
| New lead | When a record is created in **Leads & Inquiries** | **Send email** to resetpilates11@gmail.com. Subject: `New lead: {Name}`. Body: Name, Phone, Interested in, Preferred time, How did you hear, Page / source |
| New purchase | When a record is created in **Payments** | Send email: `New order: {Payment} ₪{Amount} ({Method}) — confirm payment, then set the Membership to Active` |
| New gift card | When a record is created in **Gift Cards** | Send email: `Gift card {Code}: ₪{Value} for {Recipient name}` |
| First booking | When a record matches conditions in **Bookings**: Status = Booked | Send email: `Booking: {Booking}` |

Turn each one on. The free Airtable plan has a monthly limit on automation runs; if the studio gets busy, the Team plan removes it.

WhatsApp alerts to Orit come later from the relay, once the studio's WhatsApp Business number is set up. Same for the login codes.

## 3. Views to add (Airtable, ~15 minutes)

In each tab: **Grid view → + Create → Grid**, name it, then add the filter.

**Members**
- **Win-back**: Days since last class ≥ 21, and Unsubscribed is not checked
- **New leads**: Lifecycle stage = New enquiry
- **Marketing list**: Marketing consent is checked, and Unsubscribed is not checked
- **Birthdays this month**: Birthday month = this month's name

**Memberships**
- **Waiting for payment**: Status is empty
- **Renewing this week**: Days to renewal ≤ 7, and Status = Active
- **Pass running low**: Sessions left ≤ 2, and Status = Active

**Leads & Inquiries**
- **To call back**: Status = New. Sort by Received on, newest first.

**Payments**
- **Pending**: Status = Pending

**Bookings**
- **Today**: Class time is today. Group by Class.
- **Late cancels and no-shows**: Status is Late cancel or No-show

**Classes**
- **Needs filling**: Date & time is within the next 2 days, and Spots left ≥ 3

## 4. Daily routine for Orit

1. **Payments → Pending**: once the money is in, set Status to **Paid**, then open the linked Membership and set it to **Active**.
2. **Leads → To call back**: call, then set Status to Contacted or Booked first class.
3. **Bookings → Today**: the front-desk list.

## 5. Health data in its own base (do before real customers)

Airtable can't hide one tab from people who can open the base. Health & Consent and Trainer Check-ins will move to a separate base that only Orit opens.

1. Signed in as **re:set**, create a new empty base in the re:set workspace named **re:set Health (Orit only)**.
2. **Share → Invite by email**: add the CDLVP Airtable account as **Creator**, so Claude can build the tabs. Remove that access when it's done.
3. Tell Claude. It creates the two tabs there and adds a simple "Health declaration: Valid / Expired / Missing" field in Members.
4. Then delete the two old tabs from the main base. They only hold sample data.

## 6. Before launch

- Delete every record whose name starts with **SAMPLE**, in all tabs.
- Delete the Bookings field **UNUSED - safe to delete**.
- Have a lawyer approve the terms, cancellation policy, health declaration and gift-card wording. Israeli law sets a minimum validity for gift vouchers, so gift cards are saved without an expiry date until that's confirmed.
