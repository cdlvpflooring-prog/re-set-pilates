import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
  book: (slot: ClassSlot, bed: number | null, remind: boolean) => Booking;
  cancel: (bookingId: string) => void;
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
    return { ...initial, ...saved, profile: { ...initial.profile, ...rest } };
  } catch {
    return initial;
  }
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* private mode: state stays in memory */
    }
  }, [s]);

  const book = useCallback<Store["book"]>((slot, bed, remind) => {
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
    };
    setS((p) => {
      // Never book past the plan's allowance (weekly cap or pass balance)
      const plan = p.planId ? planById(p.planId) : undefined;
      if (plan && planUsage(plan, p.bookings, fromISO(slot.date), p.memberSince).left <= 0) return p;
      return { ...p, bookings: [...p.bookings.filter((x) => x.slotId !== slot.id), b] };
    });
    return b;
  }, []);
  const cancel = useCallback((id: string) => setS((p) => ({ ...p, bookings: p.bookings.filter((b) => b.id !== id) })), []);
  const joinWaitlist = useCallback((id: string) => setS((p) => ({ ...p, waitlist: [...new Set([...p.waitlist, id])] })), []);
  const leaveWaitlist = useCallback((id: string) => setS((p) => ({ ...p, waitlist: p.waitlist.filter((w) => w !== id) })), []);
  const setPlan = useCallback(
    (planId: string | null) =>
      setS((p) => ({ ...p, planId, memberSince: planId ? (p.memberSince ?? new Date().toISOString()) : null })),
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
      setRemoteId,
    };
  }, [s, book, cancel, joinWaitlist, leaveWaitlist, setPlan, setReminders, markWelcomeSeen, saveProfile, setRemoteId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
