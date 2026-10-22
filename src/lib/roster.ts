// Who is booked on which bed, per class slot, for the bed sketches on the schedule.
// Read from GET /api/roster (the Worker answers from Airtable with only the name each person chose to show).
import { useEffect, useState } from "react";
import type { ClassSlot } from "./booking";
import type { RosterReply } from "./relayTypes";

export type RosterSlots = NonNullable<RosterReply["slots"]>;

/**
 * Preview only: open any schedule page with ?sample to see the beds filled with made-up names.
 * Never shown otherwise, so visitors don't see invented bookings.
 */
const SAMPLE: Record<string, { bed: number | null; name: string }[]> = {
  "08:00": [{ bed: 0, name: "M. Levi" }, { bed: 2, name: "N. Cohen" }, { bed: 3, name: "" }],
  "09:00": [{ bed: 1, name: "D. Mizrahi" }],
  "10:00": [{ bed: 0, name: "S. Katz" }, { bed: 1, name: "T. Ben-David" }, { bed: 2, name: "" }, { bed: 4, name: "Y. Shapiro" }],
  "11:00": [{ bed: 0, name: "L. Amar" }, { bed: 1, name: "R. Golan" }, { bed: 2, name: "G. Peretz" }, { bed: 3, name: "A. Levi" }, { bed: 4, name: "" }],
};
export const sampleBeds = (time: string) =>
  typeof location !== "undefined" && new URLSearchParams(location.search).has("sample") ? SAMPLE[time] ?? [] : null;
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

/**
 * The slot with its real availability: beds taken by the studio's bookings ("any bed" bookings take the first free one).
 * Falls back to the slot as given when the relay can't answer.
 */
export async function withRoster(slot: ClassSlot): Promise<ClassSlot> {
  if (!slot.capacity) return slot;
  const roster = sampleBeds(slot.time) ? null : await fetchRoster(slot.date);
  // A class with no bookings is simply absent from the roster: all beds free (not the sample availability)
  const booked = sampleBeds(slot.time) ?? (roster ? (roster[slot.id] ?? []) : undefined);
  if (!booked) return slot; // relay unreachable (offline, local dev): keep the slot as given
  const taken = new Set(booked.map((b) => b.bed).filter((b): b is number => b !== null && b < slot.capacity!));
  for (let n = booked.filter((x) => x.bed === null).length; n > 0; n--) {
    const free = Array.from({ length: slot.capacity }, (_, i) => i).find((i) => !taken.has(i));
    if (free !== undefined) taken.add(free);
  }
  const takenBeds = [...taken];
  return { ...slot, takenBeds, full: takenBeds.length >= slot.capacity };
}
