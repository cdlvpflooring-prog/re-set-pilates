import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { planById } from "../config/pricing";
import { fromISO, slotStart, type ClassSlot } from "./booking";
import { planUsage } from "./plan";

export interface Booking {
  id: string;
  slotId: string;
  service: ClassSlot["service"];
  date: string;
  time: string;
  minutes: number;
  instructorId: string;
  bed: number | null;
  remind: boolean;
  bookedAt?: string; // when the booking was made (ISO)
  cancelledLate?: boolean; // cancelled inside the policy window: no longer attended, but the session stays used
  remoteId?: string; // Airtable record id from the relay, used to cancel there too
}

export interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  heard?: string; // "How did you hear about us?" — asked once
  consented?: boolean; // ticked "Send me news and offers" at least once
}

interface Persisted {
  planId: string | null; // active membership/pass id; null => visitor
  memberSince: string | null;
  planStart: string | null; // when the current plan was bought; pass balances and validity count from here
  bookings: Booking[];
  waitlist: string[]; // slot ids
  reminders: boolean;
  seenWelcome: boolean;
  profile: Profile;
}

interface Store extends Persisted {
  isMember: boolean;
  upcoming: Booking[];
  past: Booking[];
  /** Returns null when the plan's allowance is used up (weekly cap, pass balance or expired pass). */
  book: (slot: ClassSlot, bed: number | null, remind: boolean) => Booking | null;
  /** `late` keeps the booking on the record (hidden from lists) so the plan still counts it. */
  cancel: (bookingId: string, late?: boolean) => void;
  joinWaitlist: (slotId: string) => void;
  leaveWaitlist: (slotId: string) => void;
  setPlan: (planId: string | null) => void;
  setReminders: (on: boolean) => void;
  markWelcomeSeen: () => void;
  saveProfile: (p: Partial<Profile>) => void;
  setRemoteId: (bookingId: string, remoteId: string) => void;
}

const KEY = "reset.v1";
const initial: Persisted = {
  planId: null,
  memberSince: null,
  planStart: null,
  bookings: [],
  waitlist: [],
  reminders: true,
  seenWelcome: false,
  profile: { firstName: "", lastName: "", phone: "", email: "" },
};

function load(): Persisted {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    const { name, ...rest } = saved.profile ?? {};
    // Older versions kept one "name" box: split it into first and last name.
    if (name && !rest.firstName) {
      const [first, ...last] = String(name).trim().split(/\s+/);
      Object.assign(rest, { firstName: first ?? "", lastName: last.join(" ") });
    }
    return { ...initial, planStart: saved.memberSince ?? null, ...saved, profile: { ...initial.profile, ...rest } };
  } catch {
    return initial;
  }
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(load);
  const latest = useRef(s);
  latest.current = s;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* private mode: state stays in memory */
    }
  }, [s]);

  const book = useCallback<Store["book"]>((slot, bed, remind) => {
    // Never book past the plan's allowance; a booking for the same slot is being replaced, so it doesn't count
    const allowed = (p: Persisted) => {
      const plan = p.planId ? planById(p.planId) : undefined;
      const others = p.bookings.filter((x) => x.slotId !== slot.id);
      return !plan || planUsage(plan, others, fromISO(slot.date), p.planStart).left > 0;
    };
    if (!allowed(latest.current)) return null;
    const b: Booking = {
      id: `b${Date.now()}`,
      slotId: slot.id,
      service: slot.service,
      date: slot.date,
      time: slot.time,
      minutes: slot.minutes,
      instructorId: slot.instructorId,
      bed,
      remind,
      bookedAt: new Date().toISOString(),
    };
    setS((p) => (allowed(p) ? { ...p, bookings: [...p.bookings.filter((x) => x.slotId !== slot.id), b] } : p));
    return b;
  }, []);
  const cancel = useCallback(
    (id: string, late = false) =>
      setS((p) => ({
        ...p,
        bookings: late ? p.bookings.map((b) => (b.id === id ? { ...b, cancelledLate: true } : b)) : p.bookings.filter((b) => b.id !== id),
      })),
    [],
  );
  const joinWaitlist = useCallback((id: string) => setS((p) => ({ ...p, waitlist: [...new Set([...p.waitlist, id])] })), []);
  const leaveWaitlist = useCallback((id: string) => setS((p) => ({ ...p, waitlist: p.waitlist.filter((w) => w !== id) })), []);
  const setPlan = useCallback(
    (planId: string | null) =>
      setS((p) => {
        // Every purchase starts a fresh plan period; "member since" keeps the first one
        const now = new Date().toISOString();
        return { ...p, planId, planStart: planId ? now : null, memberSince: planId ? (p.memberSince ?? now) : null };
      }),
    [],
  );
  const setReminders = useCallback((on: boolean) => setS((p) => ({ ...p, reminders: on })), []);
  const saveProfile = useCallback((pr: Partial<Profile>) => setS((p) => ({ ...p, profile: { ...p.profile, ...pr } })), []);
  const setRemoteId = useCallback(
    (bookingId: string, remoteId: string) =>
      setS((p) => ({ ...p, bookings: p.bookings.map((b) => (b.id === bookingId ? { ...b, remoteId } : b)) })),
    [],
  );
  const markWelcomeSeen = useCallback(() => setS((p) => (p.seenWelcome ? p : { ...p, seenWelcome: true })), []);

  // Upcoming/past depend on the clock: refresh once a minute and whenever the app comes back to the foreground.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const i = setInterval(bump, 60_000);
    document.addEventListener("visibilitychange", bump);
    return () => {
      clearInterval(i);
      document.removeEventListener("visibilitychange", bump);
    };
  }, []);

  const value = useMemo<Store>(() => {
    const now = new Date();
    const sorted = s.bookings.filter((b) => !b.cancelledLate).sort((a, b) => slotStart(a).getTime() - slotStart(b).getTime());
    return {
      ...s,
      isMember: !!s.planId,
      upcoming: sorted.filter((b) => slotStart(b) > now),
      past: sorted.filter((b) => slotStart(b) <= now).reverse(),
      book,
      cancel,
      joinWaitlist,
      leaveWaitlist,
      setPlan,
      setReminders,
      markWelcomeSeen,
      saveProfile,
      setRemoteId,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick only forces the clock-based split to recompute
  }, [s, tick, book, cancel, joinWaitlist, leaveWaitlist, setPlan, setReminders, markWelcomeSeen, saveProfile, setRemoteId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
