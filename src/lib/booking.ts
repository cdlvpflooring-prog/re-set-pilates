import { siteConfig } from "../config/site";
import { instructors } from "../config/team";

// Booking adapter. The UI only talks to `bookingProvider`; swap the mock for an
// Arbox-backed implementation once the public API/booking URL is verified.
export type BookableService = "reformer" | "mat";

export interface ClassSlot {
  id: string; // `${service}_${date}_${HHmm}`
  service: BookableService;
  date: string; // YYYY-MM-DD (local)
  time: string; // HH:mm
  minutes: number;
  instructorId: string;
  capacity: number | null; // null = capacity not exposed (Mat: TODO_VERIFY)
  takenBeds: number[]; // bed indexes 0..4 (Reformer only)
  full: boolean;
}

export interface BookingProvider {
  isLive: boolean; // false => UI labels availability as sample data
  getSchedule(service: BookableService, date: string): Promise<ClassSlot[]>;
  getSlot(id: string): Promise<ClassSlot | null>;
}

const TEMPLATE: Record<BookableService, [time: string, instructor: number][]> = {
  reformer: [["07:00", 0], ["08:00", 1], ["09:30", 2], ["18:00", 0], ["19:00", 1], ["20:00", 2]],
  mat: [["10:30", 1], ["18:30", 2]],
};
const BED_ORDER = [2, 0, 4, 1, 3];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const slotStart = (slot: Pick<ClassSlot, "date" | "time">) => {
  const d = fromISO(slot.date);
  const [h, m] = slot.time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

function build(service: BookableService, date: string, time: string, instructor: number): ClassSlot {
  const id = `${service}_${date}_${time.replace(":", "")}`;
  const cap = service === "reformer" ? siteConfig.capacity.reformerBeds : null;
  const taken = cap ? hash(id) % (cap + 1) : 0;
  return {
    id,
    service,
    date,
    time,
    minutes: 50,
    instructorId: instructors[instructor].id,
    capacity: cap,
    takenBeds: BED_ORDER.slice(0, taken),
    full: !!cap && taken >= cap,
  };
}

const mockProvider: BookingProvider = {
  isLive: false,
  async getSchedule(service, date) {
    const day = fromISO(date);
    if (day.getDay() === 6) return []; // closed Saturdays (TODO_VERIFY hours)
    const now = new Date();
    return TEMPLATE[service]
      .map(([time, ins]) => build(service, date, time, ins))
      .filter((s) => slotStart(s) > now);
  },
  async getSlot(id) {
    const [service, date, hhmm] = id.split("_");
    if ((service !== "reformer" && service !== "mat") || !date || !hhmm) return null;
    const time = `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
    const row = TEMPLATE[service].find(([t]) => t === time);
    return row ? build(service, date, time, row[1]) : null;
  },
};

export const bookingProvider: BookingProvider = mockProvider;

export const upcomingDays = (count = 10) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
