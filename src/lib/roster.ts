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
  "08:00": [{ bed: 0, name: "Maya L." }, { bed: 2, name: "Noa Cohen" }, { bed: 3, name: "" }],
  "09:00": [{ bed: 1, name: "Dana M." }],
  "10:00": [{ bed: 0, name: "Shira K." }, { bed: 1, name: "Tal B." }, { bed: 2, name: "" }, { bed: 4, name: "Yael S." }],
  "11:00": [{ bed: 0, name: "Lior A." }, { bed: 1, name: "Rona G." }, { bed: 2, name: "Gal P." }, { bed: 3, name: "Adi Levi" }, { bed: 4, name: "" }],
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
  const booked = sampleBeds(slot.time) ?? (await fetchRoster(slot.date))?.[slot.id];
  if (!booked) return slot;
  const taken = new Set(booked.map((b) => b.bed).filter((b): b is number => b !== null && b < slot.capacity!));
  for (let n = booked.filter((x) => x.bed === null).length; n > 0; n--) {
    const free = Array.from({ length: slot.capacity }, (_, i) => i).find((i) => !taken.has(i));
    if (free !== undefined) taken.add(free);
  }
  const takenBeds = [...taken];
  return { ...slot, takenBeds, full: takenBeds.length >= slot.capacity };
}
