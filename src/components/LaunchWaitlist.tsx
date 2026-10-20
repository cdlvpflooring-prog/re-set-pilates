// Shown instead of a checkout while online payment is not live (siteConfig.flags.paymentsLive = false).
// Saves name, phone and the preferred time to Airtable "Launch Waitlist" so Orit can call people once it opens.
import { useState, type FormEvent } from "react";
import { track } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { relay } from "../lib/relay";
import { LAUNCH_TIMES, type LaunchClass, type LaunchSource, type LaunchTime } from "../lib/relayTypes";
import { useStore } from "../lib/store";
import { ConsentField, ContactFields, profileFrom, readContact, readExtras } from "./forms";
import { Check } from "./ui";

const CLASS_CHOICES: LaunchClass[] = ["Reformer", "Mat", "Teens", "Not sure"];

export function LaunchWaitlist({
  source,
  classType,
  planId,
  wanted,
  slot,
}: {
  source: LaunchSource;
  classType?: LaunchClass; // preselected; "Gift card" hides the class question
  planId?: string;
  wanted?: string;
  slot?: string;
}) {
  const { t, lang } = useI18n();
  const store = useStore();
  const w = t.launchWaitlist;
  const [cls, setCls] = useState<LaunchClass>(classType ?? "Reformer");
  const [time, setTime] = useState<LaunchTime>(classType === "Teens" ? "Teen evening" : "Adult morning");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<"sent" | "queued" | null>(null);

  const pickClass = (c: LaunchClass) => {
    setCls(c);
    if (c === "Teens") setTime("Teen evening");
    else if (time === "Teen evening") setTime("Adult morning");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const contact = readContact(f);
    const x = readExtras(f);
    setSending(true);
    setFailed(false);
    const r = await relay("launch-waitlist", {
      lang, contact, classType: cls, prefTime: classType === "Gift card" ? undefined : time, source, planId, wanted, slot, consent: x.consent, website: x.website,
    });
    setSending(false);
    if (!r.ok && !r.queued) {
      setFailed(true);
      return;
    }
    store.saveProfile(profileFrom(contact, x));
    track("launch_waitlist_join", { source, classType: cls, time });
    setDone(r.ok ? "sent" : "queued");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done)
    return (
      <div className="stack gap-16 center" style={{ paddingTop: 24 }}>
        <Check />
        <h2 className="display d-md">{w.doneTitle}</h2>
        <p className="muted">{w.doneSub}</p>
        {done === "queued" && <p className="small">{t.form.saved}</p>}
      </div>
    );

  return (
    <form className="stack gap-24" onSubmit={submit}>
      <div className="notice stack gap-8">
        <span className="small">{w.sub}</span>
        {(wanted || slot) && (
          <span className="small">
            <b>{w.youChose}:</b> {[wanted, slot].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
      <fieldset className="stack gap-12" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 12 }}>
          {t.form.yourDetails}
        </legend>
        <ContactFields id="lw" profile={store.profile} />
      </fieldset>

      {classType !== "Gift card" && (
        <fieldset className="stack gap-8" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="eyebrow" style={{ marginBottom: 8 }}>
            {w.classLbl}
          </legend>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            {CLASS_CHOICES.map((c) => (
              <label key={c} className="chip-radio">
                <input type="radio" name="classType" checked={cls === c} onChange={() => pickClass(c)} />
                <span>{w.classes[c]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {classType !== "Gift card" && (
      <fieldset className="stack gap-8" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 8 }}>
          {w.timeLbl}
        </legend>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {LAUNCH_TIMES.map((tm) => (
            <label key={tm} className="chip-radio">
              <input type="radio" name="prefTime" checked={time === tm} onChange={() => setTime(tm)} />
              <span>{w.times[tm]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      )}

      <ConsentField profile={store.profile} />
      <button className="btn btn--sand btn--block" disabled={sending}>
        {sending ? t.form.sending : w.cta}
      </button>
      {failed && (
        <p className="small center" role="alert">
          {t.form.failed}
        </p>
      )}
      <p className="tiny center">{w.note}</p>
    </form>
  );
}
