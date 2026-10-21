// Who is booked on which bed, per class slot, for the bed sketches on the schedule.
// Read from GET /api/roster (the Worker answers from Airtable with only the name each person chose to show).
import { useEffect, useState } from "react";
import type { RosterReply } from "./relayTypes";

export type RosterSlots = NonNullable<RosterReply["slots"]>;
const cache = new Map<string, Promise<RosterSlots | null>>();

/** Booked beds for every class on one day, or null when the relay can't answer (offline, local dev). */
export function fetchRoster(date: string): Promise<RosterSlots | null> {
  let p = cache.get(date);
  if (!p) {
    p = fetch(`/api/roster?date=${date}`)
      .then((r) => (r.ok ? (r.json() as Promise<RosterReply>) : null))
      .then((r) => (r?.ok && r.slots ? r.slots : null))
      .catch(() => null);
    cache.set(date, p);
    setTimeout(() => cache.delete(date), 60_000); // same as the edge cache: a fresh booking shows within a minute
  }
  return p;
}

export function useRoster(date: string): RosterSlots | null {
  const [slots, setSlots] = useState<RosterSlots | null>(null);
  useEffect(() => {
    let alive = true;
    setSlots(null);
    fetchRoster(date).then((s) => alive && setSlots(s));
    return () => {
      alive = false;
    };
  }, [date]);
  return slots;
}
