# Reset Pilates AI Trainer: Client Profile and KPI Spec

Version 1.1 | Audience: app developer | Studio: Reset Pilates

## 1. Strategy, goals and product promise

The AI trainer is a branded member dashboard embedded in the Reset Pilates website. Its main goal is to help Reset stand apart in the boutique Pilates studio sector. Clients should feel known, see their progress, stay engaged between classes, and feel they receive more value from every course or package.

The intended difference is the combination of studio-specific coaching, visible progress, trainer input and relevant next steps. This is a strategy to validate with clients, not a verified claim that competitors lack these features.

| Business goal | Product requirement | Success measure |
|---|---|---|
| Differentiation | Use Reset's exercise library, trainer guidance, assessments, voice and course catalog, rather than a generic chatbot | Client feedback on usefulness and distinctiveness |
| Engagement and retention | Give clients one next action, weekly recaps, check-ins and milestone celebrations | Weekly active members, attendance consistency, check-in completion, renewal rate |
| Visible progress | Show comparable baseline-to-current results and explain verified improvements | Progress views, re-assessment completion, client understanding of progress |
| Easier course/package upsells | Tie eligible recommendations to progress milestones, goals and renewal moments | Recommendation views, clicks, confirmed bookings/purchases and attributed revenue |
| More value for money | Make included guidance, trainer feedback and useful resources visible between sessions | Client-rated value for money and use of included resources |
| Website integration | Provide a branded, mobile-first, authenticated member area within the studio website | Sign-in success and dashboard task completion |
| Future nutrition/software additions | Define optional sections, versioned data contracts and integration adapters now | Successful adapter tests, consent coverage and data freshness |

### 1.1 Core member loop

Set goals and a baseline -> attend -> check in -> see a win and next action -> review progress -> earn a milestone -> consider a relevant next course or package.

Every paid recommendation must help the client's goal first. It must not replace safety advice, pressure clients who miss sessions, promise health outcomes or imply that progress requires buying more. Always keep a useful included next action available.

### 1.2 Measurement rules

Establish a baseline before setting numerical business targets. Weekly active members are distinct clients with an authenticated dashboard interaction in a studio-local calendar week; report the denominator as members entitled to dashboard access that week. Measure attendance retention separately from dashboard engagement. Define renewal cohorts from actual package expiry and purchase records.

Attribute a sale only when the confirmed booking/order carries its recommendation ID. Report unattributed sales separately. Attributed revenue is not proof of incremental lift; that requires a comparison cohort or experiment. Keep health data out of marketing analytics.

## 2. Profile structure

| Section | Source | Shown as graph |
|---|---|---|
| Consistency | Attendance data | Yes (Graph 1) |
| Progression | Trainer or AI logged per session | Yes (Graph 2) |
| Mobility and control | Baseline plus re-assessments | Yes (Graph 3) |
| Recovery and feel | Post-session check-in | Yes (Graph 4) |
| Milestones | Derived events | No, shown as badges and a timeline |

Design rule: maximum 4 graphs on the profile view. Milestones are badges, not a graph. Anything else lives in a "Details" screen one tap away. Optional nutrition/software sections must not expand the core view beyond 4 graphs.

### 2.1 Dashboard layout and perceived value

Above the graphs, show the primary goal, one recent win, a "Your next step" card and the next class or re-assessment. Show baseline-to-latest changes only when comparable data exists. Display client-visible trainer comments with author and date.

Below the graphs, show milestones, included resources and at most one eligible course/package recommendation. Clearly label included versus paid content. Show actual catalog details and explain why the recommendation fits.

Reserve optional, feature-flagged sections for:

- Nutrition and wellbeing: studio-approved education first, optional consented context later.
- Connected tools: provider, connection status, last successful sync and disconnect controls.

Missing or stale data gets a labeled empty/stale state and a next action, never an invented score or graph. Clients can dismiss paid recommendations and manage reminders.

### 2.2 Shareable progress visuals

Offer a downloadable Reset-branded card after a verified milestone or re-assessment. Preview it and let the client choose metrics and a display name or no name. Include units, baseline/latest dates and self-reported labels where applicable.

Exclude pain, injuries, weight, birth date, nutrition logs and trainer notes by default. Sharing is client-initiated. Never auto-post or create public profile links; the export grants no access to the private dashboard.

## 3. Onboarding questionnaire

Answer types: `single` (single choice), `multi` (multiple choice), `scale` (numeric scale), `number`, `text` (free text), `bool`, `date`.

Flow: Step 1 About you, Step 2 Goals, Step 3 Health and limitations, Step 4 Experience, Step 5 Schedule, Step 6 Baseline assessment. Save progress after each step. Every question can be edited later in profile settings.

### Step 1: About you

| ID | Question | Type | Options / range | Required |
|---|---|---|---|---|
| A1 | What is your name? | text | | Yes |
| A2 | Date of birth | date | | Yes |
| A3 | Height | number | cm or in | No |
| A4 | Weight | number | kg or lb | No |
| A5 | How did you hear about Reset Pilates? | single | Friend, Instagram, Google, Walk-in, Other | No |

### Step 2: Goals

| ID | Question | Type | Options / range | Required |
|---|---|---|---|---|
| G1 | What are your main goals? (pick up to 3) | multi | Strength, Rehab or injury recovery, Posture, Flexibility, Toning, Weight management, Stress relief, Pre/postnatal fitness, Sport performance | Yes |
| G2 | Which one matters most? | single | Choice from G1 answers | Yes |
| G3 | Describe what success looks like for you in 3 months | text | Max 300 chars | No |
| G4 | How motivated are you right now? | scale | 1 to 5 | No |

### Step 3: Injuries and limitations

| ID | Question | Type | Options / range | Required |
|---|---|---|---|---|
| H1 | Do you have any current injuries or pain? | bool | Yes / No | Yes |
| H2 | Where? (if H1 = Yes) | multi | Neck, Shoulders, Upper back, Lower back, Hips, Knees, Ankles, Wrists, Other | Cond. |
| H3 | Pain level on a typical day (if H1 = Yes) | scale | 0 to 10 | Cond. |
| H4 | Describe the injury or condition and any diagnosis | text | | Cond. |
| H5 | Past surgeries in the last 2 years? | text | | No |
| H6 | Do you have any of these conditions? | multi | Pregnancy, Postpartum (under 12 months), Osteoporosis, Hypertension, Diastasis recti, Herniated disc, Scoliosis, Arthritis, Other, None | Yes |
| H7 | Has a doctor restricted any movement? | text | | No |
| H8 | Are you currently seeing a physio or doctor for this? | bool | | No |
| H9 | Health-data consent and training-scope acknowledgment | bool | Store text version and timestamp; consent is not medical clearance | Yes |

Logic: if H6 includes Pregnancy, Postpartum, Osteoporosis or Herniated disc, or H3 is 7 or higher, flag the profile "needs trainer review" and suspend new automated exercise/load recommendations until a trainer records approved restrictions and a plan under the studio safety protocol.

### Step 4: Experience

| ID | Question | Type | Options / range | Required |
|---|---|---|---|---|
| E1 | Pilates experience | single | Never tried, Under 6 months, 6 to 24 months, 2+ years | Yes |
| E2 | Which equipment have you used? | multi | Mat, Reformer, Cadillac/Tower, Chair, Barrels, None | Yes |
| E3 | Other regular exercise | multi | Strength training, Running, Yoga, Cycling, Swimming, Team sport, None, Other | No |
| E4 | Self-rated fitness level | scale | 1 (low) to 5 (high) | Yes |
| E5 | Self-rated core strength | scale | 1 to 5 | No |

Initial level mapping (editable by trainer): E1 = Never tried or Under 6 months maps to Basic; 6 to 24 months maps to Intermediate; 2+ years maps to Advanced. The baseline assessment can override this.

### Step 5: Schedule and preferences

| ID | Question | Type | Options / range | Required |
|---|---|---|---|---|
| S1 | Target sessions per week | single | 1, 2, 3, 4, 5+ | Yes |
| S2 | Preferred days | multi | Mon to Sun | No |
| S3 | Preferred time of day | multi | Morning, Midday, Evening | No |
| S4 | Preferred class type | multi | Mat, Reformer, Private, Duet, Group | No |
| S5 | Reminder preferences | multi | Push, WhatsApp, Email, None | No |
| S6 | Anything else the trainer should know? | text | | No |
| S7 | Show relevant course/package suggestions in my dashboard? | bool | Yes / No; editable later | No |
| S8 | Consent to optional promotional messages | bool | Separate from service reminders; channel-specific | No |

S1 sets the client's weekly goal, used by the Consistency KPI. Missing S7 defaults to no personalized paid suggestions; missing S8 defaults to no promotional messages. S5 is a channel preference, not promotional consent.

### Step 6: Baseline assessment (about 5 minutes)

Done in studio with a trainer, or self-guided with video instructions. Results are stored as the first data point on the graphs. See section 4.3 for definitions.

| ID | Test | Type | Unit |
|---|---|---|---|
| B1 | Plank hold (max, stop at form break) | number | seconds |
| B2 | Single-leg balance, left (eyes open) | number | seconds, cap 60 |
| B3 | Single-leg balance, right (eyes open) | number | seconds, cap 60 |
| B4 | Sit-and-reach | number | cm (negative = short of toes) |
| B5 | Shoulder mobility (rating) | scale | 1 to 5 |
| B6 | Hip mobility (rating) | scale | 1 to 5 |
| B7 | Trainer notes on posture and movement quality | text | |

Rating guide for B5 and B6: 1 = severely restricted or painful, 2 = limited, 3 = functional, 4 = good, 5 = full range with control.

## 4. KPI definitions

### 4.1 Consistency (Graph 1)

| KPI | What it is | How collected | Update frequency | Why it matters |
|---|---|---|---|---|
| Sessions per week vs goal | Attended sessions in a calendar week divided by target (S1). Show as count and percent | Auto from booking and check-in data | Daily, weekly rollup | Primary retention signal. Default review signal: below 60% of goal for 3 weeks; validate as a retention heuristic |
| Current streak | Consecutive weeks where the client met at least 80% of goal | Derived | Weekly | Builds habit, easy to understand |
| Longest streak | Best streak ever | Derived | Weekly | Motivation, milestone trigger |
| Attendance trend | 4-week moving average of sessions per week | Derived | Weekly | Shows direction, catches drop-off early |
| Late cancels and no-shows | Count in last 30 days | Auto from bookings | Daily | Secondary signal, shown in Details only |

Graph 1: combined chart, weekly sessions (bars) against goal (line), last 12 weeks. Streak shown as a number beside it. Use studio-local weeks and effective-dated goals; changing a target must not rewrite past results. Label approved pauses and exclude them from risk detection. Do not label incomplete weeks as failures.

### 4.2 Progression (Graph 2)

| KPI | What it is | How collected | Update frequency | Why it matters |
|---|---|---|---|---|
| Spring resistance level | Reformer spring load used, per move family, recorded as a spring setting (for example 1 red, 2 blue) or numeric load score 1 to 10 | Trainer or client logs per session. AI suggests the next load | Per session | Objective strength progress |
| Exercise level unlocked | Level per move family: Basic, Intermediate, Advanced. Families: Core, Legs, Upper body (add Full body later) | Trainer sign-off; AI flags a candidate (see below) | Per session, reviewed monthly | Clear sense of advancement |
| Volume | Total sets and reps per move family per session | Per session log | Per session | Detail view only |

Level-up candidate rule (studio configurable): propose the next level when studio-defined exit exercises for the current level are completed in 3 of the last 4 relevant sessions with trainer-verified form rating of 4 or more (1 to 5). Trainer sign-off is required before changing level state. Self-reported or AI-estimated form does not qualify as verified evidence. Suppress candidates during safety review.

Compare resistance only within matching equipment, exercise variants and scale versions. Higher spring resistance is not always greater difficulty; explain progression in context rather than as a universal strength score.

Graph 2: step or line chart of resistance scores over time within each comparable exercise/equipment series, with level badges (B, I, A) next to each family. Do not average incompatible resistance scales.

### 4.3 Mobility and control (Graph 3)

| KPI | What it is | How collected | Update frequency | Why it matters |
|---|---|---|---|---|
| Plank hold | Seconds held with good form | Baseline, re-test | Every 4 to 6 weeks | Core endurance |
| Single-leg balance | Seconds per leg, capped at 60. Also store left/right difference | Baseline, re-test | Every 4 to 6 weeks | Stability, asymmetry detection |
| Sit-and-reach | cm from toes | Baseline, re-test | Every 4 to 6 weeks | Hamstring and lower back flexibility |
| Shoulder mobility | Rating 1 to 5 | Baseline, re-test | Every 4 to 6 weeks | Posture and upper body function |
| Hip mobility | Rating 1 to 5 | Baseline, re-test | Every 4 to 6 weeks | Gait and lower back health |
| Composite control score | Each test normalized to 0 to 100, averaged | Derived | After each assessment | One number for the graph |

Proposed display targets, subject to studio approval, not clinical norms: plank 120 s = 100, balance 60 s = 100, sit-and-reach +15 cm = 100 and -15 cm = 0, ratings 1 to 5 map to 0 to 100.

Clamp normalized values to 0 to 100. Use mean left/right balance for the balance axis. Calculate the composite only when all five axes are present; otherwise show an incomplete assessment. Store protocol/normalization versions and compare matching versions only. Display actual units alongside scores.

Graph 3: radar chart with 5 axes (baseline vs latest). The composite score is shown as a single number. The app prompts for a re-assessment every 4 to 6 weeks.

### 4.4 Recovery and how they feel (Graph 4)

| KPI | What it is | How collected | Update frequency | Why it matters |
|---|---|---|---|---|
| Post-session soreness | Scale 0 (none) to 10 (severe) | Check-in within 2 hours after session and next morning (optional) | Per session | Detects overload |
| Energy level | Scale 1 to 5 | Pre-session and post-session tap | Per session | Readiness and mood |
| Pain score | 0 to 10, plus location (body map) | Post-session check-in, required for clients flagged in H1 | Per session | Safety, critical for rehab clients |
| Sleep quality (optional) | Scale 1 to 5 | Weekly check-in | Weekly | Context for recovery |

Alert rules: pain 7 or higher in any check-in, or pain rising 3 sessions in a row, creates a trainer review task and suspends new automated exercise/load suggestions until review; use studio-approved stop-and-seek-guidance wording. Soreness 8 or higher for 2 sessions in a row requests review and prevents automated load increases. Track acknowledgment and resolution, retry failed notifications, and never infer safety from a missing check-in.

Graph 4: dual line chart, energy and soreness per session, with pain shown as colored dots (green 0 to 3, yellow 4 to 6, red 7 to 10).

### 4.5 Milestones (badges and timeline)

Milestones are derived events. Show as badges on the profile and in a timeline. Notify the client when earned.

| Milestone | Rule |
|---|---|
| First class | First attended session |
| First teaser | Teaser logged with form rating 3 or more |
| First 60-second plank | Plank hold 60 s or more |
| 10, 25, 50, 100 sessions | Lifetime attended count |
| 4-week streak, 12-week streak | Streak thresholds |
| Level up | Any move family level change |
| Low-pain week | 7 consecutive days with a pain report each day and all scores at 2 or lower, for clients who started with H1 = Yes; label self-reported, not pain-free |
| Re-assessment improvement | Composite control score up 10 or more points vs baseline |

## 5. Data model (suggested)

```
client_profile
  id, name, dob, height, weight, created_at
  goals[], primary_goal, target_sessions_per_week
  experience_level, equipment_used[]
  flags[]            // e.g. needs_trainer_review
  onboarding_answers // JSON keyed by question ID

session_log
  id, client_id, date, class_type, trainer_id
  attended (bool)

exercise_log
  id, session_id, move_family, exercise, spring_setting
  resistance_score, sets, reps, form_rating

assessment
  id, client_id, date, type (baseline | reassessment)
  plank_s, balance_left_s, balance_right_s, sit_reach_cm
  shoulder_rating, hip_rating, composite_score, notes

checkin
  id, client_id, session_id, timestamp, timing (pre | post | next_morning)
  soreness, energy, pain, pain_locations[]

level_state
  client_id, move_family, level (basic | intermediate | advanced), updated_at

milestone
  id, client_id, type, earned_at
```

### 5.1 Strategy and integration extensions

Use studio-scoped IDs, UTC timestamps, studio-local rollups and versioned schemas. Extend existing exercise/assessment records with source, verifier, equipment, protocol and scoring versions. Store nullable check-in values rather than zero for missing reports. Add provider session ID and booking status to session logs. Milestones reference evidence IDs and a rule version.

```text
goal_history
  id, client_id, target_sessions_per_week, effective_from, effective_to

client_preferences
  client_id, paid_suggestions_enabled, reminder_channels[], updated_at

trainer_note
  id, client_id, author_id, text, visibility (client | staff), created_at

review_task
  id, client_id, type, evidence_ids[], assigned_trainer_id
  status (open | acknowledged | resolved), created_at, resolved_at, resolution

catalog_item
  id, studio_id, external_id, type (course | package | private_session)
  title, goal_tags[], required_level, prerequisites, included_resource_ids[]
  price, currency, schedule, capacity_status, booking_url, active
  source_provider, synced_at, version

client_entitlement
  id, client_id, catalog_item_id, external_order_id
  status, credits_remaining, starts_at, expires_at, synced_at

recommendation
  id, client_id, catalog_item_id, trigger_type, evidence_ids[], rationale
  rule_version, catalog_version, created_at, expires_at
  status (candidate | approved | shown | dismissed | expired | converted)
  approved_by, shown_at, dismissed_at, converted_order_id

content_resource
  id, studio_id, module (pilates | nutrition | wellbeing), title, content_ref
  included_or_paid, required_entitlement_id, source_name, source_url
  reviewed_by, reviewed_at, review_due_at, version

module_config
  studio_id, module_key, enabled, schema_version
  approved_provider_id, required_consent_scopes[], display_section

integration_connection
  id, studio_id, client_id (nullable), provider, scopes[], status
  credential_ref, last_success_at, last_error_code

external_record
  id, connection_id, external_id, record_type, observed_at, received_at
  schema_version, payload_ref, source_unit, sync_status

nutrition_context  // future, optional, separately consented
  id, client_id, source_record_id, recorded_at, schema_version
  preference_tags[], client_goal, approved_context_fields, provenance

consent_record
  id, client_id, scope, channel, text_version, granted_at, revoked_at

product_event
  id, studio_id, client_id, event_name, occurred_at
  recommendation_id, resource_id, milestone_id, order_id
  schema_version, approved_properties
```

### 5.2 Integration and analytics contracts

- Define provider adapters for attendance, bookings, catalog, entitlements, resources and optional wellbeing context. The studio will supply nutrition information and additional software choices later; no provider is assumed.
- Booking software owns attendance/bookings. Commerce/catalog software owns prices, availability, credits and purchases. Hide personalized paid cards when required inputs are stale or unverifiable; configure freshness limits per provider.
- Verify webhook signatures where supported, deduplicate by connection plus external ID, and reconcile failed/missed events. A retry must not add another session, milestone or sale.
- Keep credentials server-side. Imported text is data, not instructions for the AI. Validate units, ranges, source identity and timestamps before storing or plotting.
- Track onboarding completion, dashboard/progress views, check-in and assessment completion, milestones, recap views, resource use, progress exports, recommendation views/clicks/dismissals, confirmed bookings and confirmed purchases.
- Record conversion only from a confirmed provider record, not a CTA click. Carry recommendation IDs through checkout when supported. Exclude health fields and free-text health notes from analytics.
- Nutrition starts disabled, with no placeholder collection. Activate only after content review, provider mapping, consent and professional scope are approved. Reviewed education can precede individualized context.

## 6. AI trainer behavior (requirements)

### 6.1 Coaching and engagement

- Use onboarding, restrictions and review status to select the studio-approved exercise library.
- Suggest next-session load/exercises from the last 3 relevant sessions and check-ins, within trainer-approved limits. Ask for missing inputs rather than inventing them.
- Prompt for check-ins and re-assessments, respecting preferences and quiet hours. Give one clear next action.
- Escalate on the alert rules in section 4.4 and red flags in step 3. Safety review overrides progression and personalized paid suggestions.
- Give no diagnoses or treatment promises. Show scope/disclaimer text in onboarding and profile; disclaimers do not replace safety controls.
- Weekly recap: sessions vs goal, one supported win, a comparable progress change if available, and one useful next action. Flat progress gets honest, supportive framing and an invitation to a trainer check-in.
- Make trainer input and included resources visible so clients see value between classes. Label optional paid content clearly.
- Nutrition advice is outside MVP. Later use approved resources and permitted context only; do not generate medical diets or infer nutrition needs from health fields.

### 6.2 Upsell and renewal rules

A deterministic eligibility layer selects candidates before AI writes the rationale. AI cannot change prices, prerequisites, capacity or evidence. These are proposed defaults for studio approval, not proven conversion rules.

| Trigger | Candidate | Evidence and controls |
|---|---|---|
| Trainer-approved level-up | Next-level course | Verified level change, satisfied prerequisites, current schedule/capacity |
| Goal-aligned re-assessment improvement | Matching course or optional private session | Comparable results and goal tags; no promises of outcomes |
| Attendance milestone or 4-week streak | Suitable follow-on course/package | Verified milestone, course fit and actual entitlement state |
| Package nearing expiry or low credits | Renewal or suitable package | Provider-confirmed expiry/credits; configurable lead time; no duplicate/pending renewal |
| Client adds a goal | Goal-matched course | Updated goal and catalog match |
| Missed goals or stalled progress | Included support or trainer check-in first | Not an automatic sales trigger; a paid option requires a later explicit request or trainer-reviewed fit |

- Require paid-suggestion preference, fresh catalog/entitlement data, satisfied prerequisites and no unresolved safety review. Never target offers using sensitive health or nutrition fields.
- Show one paid card at most. Proposed configurable defaults: 14-day cooldown between new paid cards; dismissing an item suppresses it for 30 days. Explicit catalog exploration remains available.
- Suppress already booked/owned items unless a valid renewal. Expire recommendations when evidence, eligibility, price or availability changes. Recheck at CTA click.
- Explain the fit using verified evidence, for example "Your trainer approved Intermediate Core. This course is designed for that level." Show current price/currency, relevant dates and included-versus-paid status.
- Link to the existing booking/checkout flow. Never auto-enroll or charge the client. Checkout owns final totals and purchase terms.
- Promotional messages require separate channel-specific consent. Service recaps must not silently become advertisements.

## 7. Privacy and consent

- Encrypt sensitive health and nutrition data in transit and at rest. Restrict access to the client and assigned trainers with server-side role checks.
- Store explicit health-data consent with text version and timestamp. Separate it from medical clearance, marketing, integration and sharing permissions.
- Keep the dashboard private. Do not expose member data in public website HTML, URLs, link previews, marketing pixels or third-party analytics.
- Audit trainer changes, safety reviews, consent, exports and recommendations. Minimize backend AI context and review provider data-use/retention terms before launch.
- Let clients export/delete data, revoke optional consents and disconnect tools. Define retention periods and exceptions before launch; revocation stops future optional collection.
- Use aggregate business reports and limited staff roles. Public sharing is never automatic; use the preview/selection rules in section 2.2.
- The studio must approve applicable jurisdiction-specific privacy, health-data and marketing requirements. This spec is not a legal compliance determination.

## 8. MVP scope and later additions

### MVP: differentiated member loop

Website-embedded private dashboard; onboarding steps 1 to 6; Graphs 1 and 4; baseline assessment; attendance milestones; trainer feedback; next-action card; weekly recap; included resources; simple milestone exports; consent/preferences and business analytics.

Safety review flags, pain alerts, notification acknowledgment and suspension of automated suggestions are MVP requirements, not later extras.

Add attendance/booking sync and minimal catalog/entitlement sync. Enable deterministic milestone/renewal cards only when those inputs and studio rules are ready. Otherwise disable personalized paid cards and provide a plain course-catalog link without inferred prices, eligibility or urgency. Coaching/progress must still work.

Define future module contracts now, but keep nutrition and unselected software disabled.

### Phase 2

Graph 2 with comparable progression and bounded AI load suggestions; Graph 3 with periodic re-assessments; trainer-reviewed level-ups; richer progress exports; goal-aligned course matching. Test recommendation effectiveness without withholding safety or necessary care.

### Later

Studio-supplied nutrition education, then optional nutrition context and selected software adapters. Wearable imports, body measurements and video form checks need separate scope, validation and consent. No provider or clinical capability is assumed.

## 9. Website embedding and architecture

### 9.1 Frontend

- Preferred route: branded dashboard inside the existing website member area. Confirm website platform and identity provider before implementation.
- Use mobile-first layouts, keyboard support, chart labels/units and text alternatives. Test narrow screens and long labels.
- If an iframe is required, restrict parent origins through CSP `frame-ancestors`, validate `postMessage` origins/schemas and provide a direct authenticated fallback route. Never put tokens or health data in URLs.
- Separate public marketing pages, private member data and staff tools. Use server-validated sessions or approved short-lived SSO exchange. A browser-supplied client ID is never authorization.
- Exports contain only selected card data, not a public dashboard link.

### 9.2 Backend contracts

Keep separate module contracts for profiles/consent, ingestion, assessments/check-ins, safety review, KPIs, resources, catalog/entitlements, eligibility rules, AI explanations and analytics. A modular monolith is acceptable for MVP.

Illustrative endpoints, with final stack and naming left to the developer:

```text
GET   /api/member/dashboard
PATCH /api/member/preferences
POST  /api/member/checkins
POST  /api/member/progress-export
GET   /api/member/resources
GET   /api/member/recommendations
POST  /api/member/recommendations/{id}/dismiss
POST  /api/staff/reviews/{id}/resolve
POST  /api/integrations/{provider}/webhook
```

Member endpoints enforce own-client access. Staff actions enforce assigned roles and audit changes. Webhooks verify provider authenticity rather than use member authentication. AI gets minimized structured context and evidence references. Generated text cannot approve safety reviews, change levels, grant entitlements or create purchases.

### 9.3 Reliability and extensibility

Use feature flags for optional modules without changing core graphs. Show historical progress with freshness labels during connector failures. Retry ingestion and trainer notifications with deduplication and failure queues; safety tasks remain open until staff acknowledgment/resolution. Keep third-party scripts away from sensitive content and rate-limit endpoints.

## 10. Open decisions for the studio

- Website platform, identity provider, booking and commerce software, API/webhook availability and recommendation attribution support.
- Spring scale, equipment models, additional move families and approved assessment/scoring protocols.
- Confirm trainer-only level-up sign-off, exercise/load limits and self-test eligibility.
- Safety-review ownership, response coverage, clearance protocol and client escalation wording.
- Actual course/package catalog, prerequisites, goal tags, included resources and recommendation lead times/cooldowns.
- Nutrition content and software to be supplied later, content reviewers, provider mappings and permitted use.
- Applicable privacy/marketing rules, retention periods and consent wording.
- Baseline and targets for engagement, retention, conversion and perceived value, plus review ownership.

## 11. Acceptance criteria

- Members can complete onboarding and access only their own data; unauthorized API/profile requests fail.
- No more than 4 core graphs appear; a useful included next action remains available without paid cards.
- Goal changes affect future weeks only; missing/stale inputs are labeled and do not create invented scores.
- Safety flags create review tasks, suspend automated suggestions and suppress personalized paid cards until review.
- Verified milestones/approved level-ups create eligible cards with traceable evidence. Self-reported form never silently approves progression.
- Owned, dismissed, stale, ineligible, sold-out and opted-out items are suppressed by configured rules; CTA clicks revalidate details.
- Only confirmed provider purchases count as conversions. Duplicate events do not duplicate sessions, milestones or revenue.
- Progress exports have a client preview, exclude health fields by default and grant no access to the private profile.
- Disabled nutrition collects no data and leaves the core dashboard unchanged; enabling an adapter requires approved mappings and consent.
- Mobile embedding and chart text alternatives work; member data stays out of public pages, URLs and marketing analytics.
- Engagement, safety, retention, conversion and client-rated value can be evaluated separately.
