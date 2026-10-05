# re:set pilates — Google Business Profile build sheet

Copy each block into business.google.com. Anything marked **NEED** is missing business data; fill it before publishing.
Rule for the whole profile: the name, address and phone must match the website, Instagram, Facebook, Waze and Arbox exactly, character for character.

---

## 1. Setup and verification

| Field | Value |
|---|---|
| Business name | `re:set pilates` (exactly as it appears on the sign at the door; nothing added) |
| Primary category | **Pilates studio** |
| Secondary categories | **Personal trainer** (for private 1:1 and duo). Add **Fitness center** only if the studio is open to drop-ins beyond booked classes. Do not add Yoga studio or Gym. |
| Customers visit the location? | Yes |
| Address | גזית 1, הוד השרון — **NEED** floor / unit / entrance if any |
| Service area | Leave empty (storefront) |
| Phone | **NEED** (the new studio number; same one on the website and Instagram) |
| Website | `https://<domain>/?utm_source=google&utm_medium=organic&utm_campaign=gbp` — **NEED** domain |
| Booking ("Appointments") link | Arbox public booking link — **NEED** (never the manage.arboxapp.com link) |
| Opening date | Set the real opening date. If the studio is not open yet, the profile can go live up to 90 days early as "opening soon". |
| Owner / managers | Orit as primary owner; add a second manager so the profile is never locked to one login. |

**Verification** (Google almost always asks for a video in Israel). Record it in one continuous take, no cuts:
1. Street sign for Gazit, then the building number.
2. The studio entrance with the re:set sign visible.
3. Unlock the door (shows you have access).
4. Inside: the reformers, the reception area, branded items.
Do this only once the sign is up. No sign = high chance of rejection or suspension.

---

## 1b. Social profiles

In the profile: **Edit profile → Contact → Social profiles → Add**. Pick the network, paste the link. These show as icons on the profile and tell Google the accounts belong to the same business.

| Network | Paste this link |
|---|---|
| Instagram | `https://www.instagram.com/resetpilates_/` |
| TikTok | `https://www.tiktok.com/@reset.pilates` |
| Facebook | `https://www.facebook.com/profile.php?id=61595012095305` |
| YouTube | only if a channel exists (studio walkthrough / class clips would fit) |

- **Facebook**: claim a username for the page first (Page settings → Username), e.g. `facebook.com/resetpilates`. Google sometimes rejects `profile.php?id=` links, and a clean username is easier to share. If you change it, also update `social.facebook` in `src/config/site.ts` so the website and the schema match.
- Only add accounts the studio owns and actually posts to. An empty or inactive account looks worse than none.
- Google may add social links on its own; check the profile once a month and remove anything that isn't yours.
- Return the favour: put the Google profile link in the Instagram and TikTok bio (link-in-bio) and on the Facebook page once the profile is live.

---

## 2. Description (Hebrew — paste this one; 750 character limit, this is ~610)

```
re:set pilates הוא סטודיו בוטיק לפילאטיס מכשירים (רפורמר) בהוד השרון. בכל שיעור יש רק 5 מיטות ומדריכה אחת, כך שכל מתאמנת מקבלת תשומת לב מלאה, תיקונים והתאמה אישית לאורך כל 50 הדקות. השיעורים מתאימים לכל הרמות, ממתחילות ועד מתאמנות ותיקות, והקפיצים של הרפורמר מאפשרים להתחיל בעדינות ולהתקדם בהדרגה.

בסטודיו: רפורמר בקבוצות קטנות, פילאטיס מזרן, אימונים אישיים 1:1 ואימוני דואו, בשעות הבוקר והערב. מנויים חודשיים או כרטיסיות גמישות.

את הסטודיו הקימה אורית, מדריכת פילאטיס ואמא לארבעה, כדי ליצור חלל קטן, חם ואישי שממנו יוצאים חזקות ורגועות יותר. נמצאים ברחוב גזית 1, הוד השרון.
```

English version (for reference / if you prefer English):

```
re:set pilates is a boutique Reformer Pilates studio in Hod Hasharon. Every class has only 5 beds and one instructor, so you get full attention, hands-on corrections and an adapted workout for all 50 minutes. Classes suit every level, from first-timers to experienced members; the Reformer's springs let you start gently and progress step by step.

We offer small-group Reformer, Mat Pilates, private 1:1 and duo sessions, mornings and evenings, with monthly memberships or flexible class passes.

The studio was founded by Orit, a Pilates instructor and mother of four, to create a small, warm and personal space where you leave stronger and calmer. Find us at Gazit 1, Hod Hasharon.
```

No prices, links, phone numbers or "best/cheapest" wording in the description (Google removes those).

---

## 3. Hours

GBP needs fixed hours. Use first class start to last class end for each day. **NEED** the weekly timetable.
Add Special hours for every holiday (Hanukkah, Purim, Pesach, Yom HaAtzmaut, Shavuot, the Tishrei holidays) a week ahead — profiles with up-to-date hours rank and convert better, and Google asks users "is this place open?" when they are missing.

---

## 4. Services (Services tab — with prices)

| Service | Description (≤300 chars) | Price |
|---|---|---|
| רפורמר בקבוצה קטנה / Reformer small group | עד 5 מתאמנות ומדריכה אחת, 50 דקות. התנגדות קפיצים שמותאמת לכל רמה. | from ₪240 / month (1×/week) |
| פילאטיס מזרן / Mat Pilates | חיזוק ליבה, גמישות ויציבה בקבוצה קטנה, 50 דקות. | **NEED** (or "included in membership") |
| אימון אישי 1:1 / Private session | מדריכה אחת, מתאמנת אחת, בתיאום מראש. מתאים לחזרה מפציעה, הריון או למי שרוצה ליווי צמוד. | **NEED** |
| אימון דואו / Duo session | שתיים ומדריכה, בתיאום מראש. | **NEED** |
| שיעור ניסיון / Intro class | **NEED** — is there an intro or first-class offer? This is the single best converting item on a studio profile. | **NEED** |

## 5. Products tab (shows as cards with photos at the top of the profile)

Use the membership flyer style images, one card each:

| Product | Price | Note |
|---|---|---|
| מנוי 1× בשבוע | ₪240 | launch ₪220 |
| מנוי 2× בשבוע | ₪460 | launch ₪430 |
| מנוי 3× בשבוע (הכי פופולרי) | ₪630 | launch ₪590 |
| מנוי 4× בשבוע | ₪800 | launch ₪750 |
| מנוי ללא הגבלה | ₪990 | launch ₪920 |
| כרטיסיית 5 | ₪300 | +1 bonus at launch, valid 2 months |
| כרטיסיית 10 | ₪550 | +1 bonus at launch, valid 2 months |
| כרטיסיית 15 | ₪750 | +1 bonus at launch, valid 2 months |
| כרטיס מתנה / Gift card | — | add once gift cards are real |

Each product's button → the matching Arbox purchase link (**NEED**).

---

## 6. Attributes (tick only what is true)

- Women-owned ✔
- Appointment required ✔ · Online appointments ✔ · Online classes ✘
- Payments: credit cards, debit cards, NFC/mobile (Bit, Apple Pay, Google Pay) — **NEED** confirm
- Wheelchair-accessible entrance / restroom / parking — **NEED** (only if true)
- Restroom ✔ · Changing room / showers — **NEED**
- Parking: free street / lot / paid — **NEED**
- LGBTQ+ friendly, Language assistance (Hebrew, English) — your call

---

## 7. Photos (the biggest lever for clicks)

Profiles with 100+ photos get far more direction requests and calls. Real photos only, no stock, no text-heavy flyers as the main images.

| Slot | Spec | What |
|---|---|---|
| Logo | 720×720, square | gold-ring logo on plain background (`logo-gold-ring.jpg` cropped square) |
| Cover | 1080×608 (16:9), bright | the wide studio shot, reformers lined up, daylight |
| Exterior ×3 | any | building from the street, the entrance with the sign, the walk from parking (helps first-timers find you) |
| Interior ×5+ | | wide room, each corner, reception, changing area |
| At work ×10+ | | real classes: Orit cueing, close-ups of springs/straps, small group in motion |
| Team | | Orit portrait, each instructor once confirmed |
| Video ×3 | 30–60s, vertical OK | studio walkthrough, a class snippet, Orit introducing the studio |

Cadence: upload the core set on day one, then 3–5 new photos a week for the first 2 months. Ask members to tag the location on Instagram too.

---

## 8. First posts (Updates tab — post weekly; each lives on the profile)

1. **Offer — launch pricing**: "מחירי השקה ל-re:set pilates: מנוי 3× בשבוע ב-₪590 במקום ₪630, ושיעור בונוס לכל כרטיסייה. לזמן מוגבל." Button: Book. Set offer start/end dates.
2. **What's new — what is a Reformer?** short explainer + photo of the springs. Button: Learn more → /faq.
3. **What's new — meet Orit**: founder story, her portrait. Button: Learn more → /about.
4. **Event — opening day / open house** if planned (**NEED** date).
Then rotate weekly: schedule highlight, member moment (with permission), tip of the week, holiday hours.

---

## 9. Q&A / FAQ seed

(Google has been phasing the public Q&A box out of profiles; if your profile still shows it, post these from the owner account. Either way they belong on the site's FAQ, which Google reads.)

- האם מתאים למתחילות? — כן. עם 5 מתאמנות בלבד, המדריכה מלווה אותך ומתאימה כל תרגיל.
- כמה זמן שיעור? — 50 דקות.
- מה ללבוש? — בגדים צמודים ונוחים וגרביים עם גריפ. מים. כל השאר בסטודיו.
- אפשר להתאמן בהריון? — **NEED** Orit to confirm up to which week.
- יש חניה? — **NEED**
- מדיניות ביטול? — ביטול עד 24 שעות לפני השיעור מחזיר את השיעור למנוי.

---

## 10. Reviews (the #1 ranking factor you control)

Goal: 25+ reviews in the first 90 days, then 4+ a month, steady rather than in bursts.

- Get the short review link from the profile ("Ask for reviews") and turn it into a QR code for the reception desk and the welcome message.
- Ask after the 3rd class, when people are happiest. WhatsApp template:

```
היי {שם}, איזה כיף שאת איתנו ב-re:set 🤍
אם נהנית מהשיעורים, נשמח מאוד אם תכתבי לנו כמה מילים בגוגל — זה עוזר לנשים נוספות בהוד השרון למצוא אותנו:
{קישור}
תודה! אורית
```

- Reply to every review within 48 hours, by name, mentioning the class they took. Reply to negative ones calmly and offer to talk privately.
- Never offer discounts or freebies for reviews, never ask only happy members, never write reviews yourself or from family. Google removes them and can suspend the profile.

---

## 11. Around the profile (makes Google trust the listing)

- **Website (done 2026-10-04)**: business schema on Home and Contact, live Google map on Home (Visit section) and Contact. Once the profile exists, fill these in `src/config/site.ts` and the site updates itself:
  - `contact.phone`, `contact.postalCode`, `contact.openingHours` (must match the profile's hours exactly)
  - `contact.geo` + `geoVerified: true` (copy the pin's coordinates from the profile)
  - `social.googleBusiness` (profile link), `social.googleReview` (review link), `social.googlePlaceId` (makes Directions open the listing, not just the address)
  - `arbox.publicBookingUrl` adds a "Book" action to the schema
- **Same details everywhere**: Instagram and Facebook bio, Waze (very important in Israel; add the place in the Waze app), Apple Business Connect (Apple Maps), Bing Places, easy.co.il, b144, Arbox studio profile.
- **Link the profile** from the website footer and Instagram link-in-bio ("Find us on Google").
- **Track**: watch Performance in GBP monthly (searches, calls, direction requests, bookings); the UTM on the website link shows Google profile visits separately in Analytics.

---

## Open items to collect from Orit

1. Phone number (and WhatsApp if separate)
2. Domain for the website
3. Arbox public booking link + per-plan purchase links
4. Weekly class timetable (for hours)
5. Exact entrance details: floor/unit, parking, accessibility
6. Mat, private and duo prices; intro-class offer if any
7. Opening date and whether the sign is up (decides when to verify)
8. Payment methods accepted
9. Pregnancy policy (up to which week)
10. Photos: real studio shoot, exterior with sign, Orit portrait, short videos
