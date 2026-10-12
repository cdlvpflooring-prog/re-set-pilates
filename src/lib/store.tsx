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
}

interface Persisted {
  planId: string | null; // active membership/pass id; null => visitor
  memberSince: string | null;
  planStart: string | null; // when the current plan was bought; pass balances and validity count from here
  bookings: Booking[];
  waitlist: string[]; // slot ids
  reminders: boolean;
  seenWelcome: boolean;
  profile: { name: string; phone: string; email: string };
}

interface Store extends Persisted {
  isMember: boolean;
  upcoming: Booking[];
  past: Booking[];
  /** Returns null when the plan's allowance is used up (weekly cap, pass balance or expired pass). */
  book: (slot: ClassSlot, bed: number | null, remind: boolean) => Booking | null;
  cancel: (bookingId: string) => void;
  joinWaitlist: (slotId: string) => void;
  leaveWaitlist: (slotId: string) => void;
  setPlan: (planId: string | null) => void;
  setReminders: (on: boolean) => void;
  markWelcomeSeen: () => void;
  saveProfile: (p: Partial<Persisted["profile"]>) => void;
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
  profile: { name: "", phone: "", email: "" },
};

function load(): Persisted {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { ...initial, planStart: saved.memberSince ?? null, ...saved, profile: { ...initial.profile, ...saved.profile } };
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
  const cancel = useCallback((id: string) => setS((p) => ({ ...p, bookings: p.bookings.filter((b) => b.id !== id) })), []);
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
  const saveProfile = useCallback(
    (pr: Partial<Persisted["profile"]>) => setS((p) => ({ ...p, profile: { ...p.profile, ...pr } })),
    [],
  );
  const markWelcomeSeen = useCallback(() => setS((p) => (p.seenWelcome ? p : { ...p, seenWelcome: true })), []);

  const value = useMemo<Store>(() => {
    const now = new Date();
    const sorted = [...s.bookings].sort((a, b) => slotStart(a).getTime() - slotStart(b).getTime());
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
    };
  }, [s, book, cancel, joinWaitlist, leaveWaitlist, setPlan, setReminders, markWelcomeSeen, saveProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
