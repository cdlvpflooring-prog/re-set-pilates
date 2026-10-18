// Shared form fields: name, phone, email, "How did you hear about us?", marketing opt-in and a spam trap.
// Values are read back with readContact()/readExtras() so every form sends the same shape to the relay.
import { useI18n } from "../lib/i18n";
import { HEARD_FROM, normalizePhone, type Contact, type HeardFrom } from "../lib/relayTypes";
import type { Profile } from "../lib/store";

export function ContactFields({ id, profile, email = "optional" }: { id: string; profile: Profile; email?: "optional" | "none" }) {
  const { t } = useI18n();
  return (
    <>
      <div className="grid-2">
        <div className="field">
          <label htmlFor={`${id}-first`}>{t.form.firstName}</label>
          <input id={`${id}-first`} name="firstName" className="input" autoComplete="given-name" defaultValue={profile.firstName} required maxLength={60} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-last`}>{t.form.lastName}</label>
          <input id={`${id}-last`} name="lastName" className="input" autoComplete="family-name" defaultValue={profile.lastName} required maxLength={60} />
        </div>
      </div>
      <div className={email === "none" ? "" : "grid-2"}>
        <div className="field">
          <label htmlFor={`${id}-phone`}>{t.form.phone}</label>
          <input
            id={`${id}-phone`}
            name="phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            defaultValue={profile.phone}
            required
            maxLength={16}
            // Same rule as the relay: an Israeli number (05X…, 0X…, or +972…).
            onInput={(e) => e.currentTarget.setCustomValidity(normalizePhone(e.currentTarget.value) ? "" : t.form.phoneInvalid)}
          />
        </div>
        {email !== "none" && (
          <div className="field">
            <label htmlFor={`${id}-email`}>{t.form.emailOptional}</label>
            <input id={`${id}-email`} name="email" className="input" type="email" autoComplete="email" dir="ltr" defaultValue={profile.email} maxLength={120} />
          </div>
        )}
      </div>
      {/* Spam trap: hidden from people, filled in by bots. */}
      <label className="hp" aria-hidden>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </>
  );
}

/** Asked once: hidden after the visitor has answered on any form. */
export function HeardField({ id, profile }: { id: string; profile: Profile }) {
  const { t } = useI18n();
  if (profile.heard) return null;
  return (
    <div className="field">
      <label htmlFor={`${id}-heard`}>{t.form.heard}</label>
      <select id={`${id}-heard`} name="heard" className="input" defaultValue="">
        <option value="">{t.form.heardPick}</option>
        {HEARD_FROM.map((h) => (
          <option key={h} value={h}>
            {t.form.heardOpts[h]}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Unticked marketing opt-in. Hidden once the visitor has opted in. */
export function ConsentField({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  if (profile.consented) return null;
  return (
    <label className="tick">
      <input type="checkbox" name="consent" />
      <span>{t.form.consent}</span>
    </label>
  );
}

export function readContact(f: FormData): Contact {
  const s = (k: string) => String(f.get(k) ?? "").trim();
  return { firstName: s("firstName"), lastName: s("lastName"), phone: s("phone"), email: s("email") || undefined };
}

export function readExtras(f: FormData) {
  const heard = HEARD_FROM.find((h) => h === f.get("heard")) as HeardFrom | undefined;
  return { heard, consent: f.get("consent") === "on", website: String(f.get("website") ?? "") };
}

/** What to remember on this device after a successful form. */
export const profileFrom = (c: Contact, x: ReturnType<typeof readExtras>): Partial<Profile> => ({
  firstName: c.firstName,
  lastName: c.lastName,
  phone: c.phone,
  ...(c.email ? { email: c.email } : {}),
  ...(x.heard ? { heard: x.heard } : {}),
  ...(x.consent ? { consented: true } : {}),
});
