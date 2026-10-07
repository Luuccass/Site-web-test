// Booking calendar for the /reserver form, computed in Europe/Paris time from content/hours.json.
// Pure functions (no React, no DOM) so they run in the browser and in unit tests alike.

export type ServiceName = "midi" | "soir";
export type ServiceRow = { day: number; service: ServiceName; open: string; close: string }; // day: 1 = Monday … 7 = Sunday
export type Closure = { from: string; to: string; kind: "conges" | "fermeture" | "privatisation"; services?: ServiceName[] };

export type CalendarInput = {
  services: ServiceRow[];
  closures: Closure[];
  publicHolidays: "call" | "open" | "closed";
  horizonDays: number;
  slotMinutes: number;
};

export type ServiceChoice =
  | { available: true; open: string; close: string; slots: string[] }
  | { available: false; reason: string };

export type BookingDay = {
  iso: string; // YYYY-MM-DD
  offset: number; // 0 = today (Paris)
  label: string; // « Aujourd'hui, mardi 7 octobre »
  longLabel: string; // « mardi 7 octobre 2026 »
  services: Record<ServiceName, ServiceChoice>;
};

export type BookingCalendar = {
  days: BookingDay[];
  /** Public holidays inside the window that would normally be open (policy « call »): phone only. */
  holidays: string[];
};

export const SERVICES: ServiceName[] = ["midi", "soir"];
export const NNBSP = " ";

const DAYS = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const pad = (n: number) => (n < 10 ? "0" : "") + n;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

function fromMinutes(total: number): string {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** « 19 h 30 », « 12 h » (narrow no-break spaces, as everywhere on the site). */
export function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}${NNBSP}h` : `${Number(h)}${NNBSP}h${NNBSP}${m}`;
}

/** Wall-clock date and time in Paris for an instant. */
export function parisNow(ms: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const o: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") o[p.type] = Number(p.value);
  return { y: o.year, m: o.month, d: o.day, minutes: o.hour * 60 + o.minute, iso: `${o.year}-${pad(o.month)}-${pad(o.day)}` };
}

type Ymd = { y: number; m: number; d: number };

// Calendar arithmetic at UTC noon, so daylight-saving changes never shift the date.
function shift(date: Ymd, days: number): Ymd {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d, 12) + days * 86_400_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
function weekday(date: Ymd): number {
  const w = new Date(Date.UTC(date.y, date.m - 1, date.d, 12)).getUTCDay();
  return w === 0 ? 7 : w;
}
const isoOf = (date: Ymd) => `${date.y}-${pad(date.m)}-${pad(date.d)}`;

function easter(y: number): Ymd {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const mm = Math.floor((a + 11 * h + 22 * l) / 451);
  return { y, m: Math.floor((h + l - 7 * mm + 114) / 31), d: ((h + l - 7 * mm + 114) % 31) + 1 };
}

/** French public holidays (same list as the live status). */
export function isPublicHoliday(date: Ymd): boolean {
  if (["01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"].includes(`${pad(date.m)}-${pad(date.d)}`)) return true;
  const e = easter(date.y);
  return [1, 39, 50].some((offset) => {
    const h = shift(e, offset); // lundi de Pâques, Ascension, lundi de Pentecôte
    return h.m === date.m && h.d === date.d;
  });
}

/** « jeudi 9 octobre », with the year when it differs from `currentYear`. */
function dayName(date: Ymd, currentYear: number, withYear = false): string {
  const base = `${DAYS[weekday(date)]} ${date.d === 1 ? "1er" : date.d} ${MONTHS[date.m - 1]}`;
  return withYear || date.y !== currentYear ? `${base} ${date.y}` : base;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Arrival times every `step` minutes inside the service window (opening included, closing excluded). */
export function slotsBetween(open: string, close: string, step: number): string[] {
  const out: string[] = [];
  for (let t = toMinutes(open); t < toMinutes(close); t += step) out.push(fromMinutes(t));
  return out;
}

function closureFor(closures: Closure[], iso: string, service: ServiceName): Closure | undefined {
  return closures.find((c) => iso >= c.from && iso <= c.to && (!c.services || c.services.includes(service)));
}

function closedReason(kind: Closure["kind"], service: ServiceName): string {
  if (kind === "privatisation") return `Restaurant privatisé ce ${service}-là.`;
  if (kind === "conges") return "Restaurant en congés ce jour-là.";
  return `Fermeture exceptionnelle ce ${service}-là.`;
}

/**
 * The dates a visitor can pick: today (if a service still has a future arrival time) through
 * `horizonDays` days ahead, skipping closed weekdays, closures and, unless the policy is « open »,
 * public holidays (with policy « call » they are listed apart so the form can say « appelez-nous »).
 */
export function buildCalendar(input: CalendarInput, nowMs: number): BookingCalendar {
  const now = parisNow(nowMs);
  const today: Ymd = { y: now.y, m: now.m, d: now.d };
  const days: BookingDay[] = [];
  const holidays: string[] = [];

  for (let offset = 0; offset <= input.horizonDays; offset++) {
    const date = shift(today, offset);
    const iso = isoOf(date);
    const wd = weekday(date);
    const rows = input.services.filter((s) => s.day === wd);
    if (!rows.length) continue;
    if (input.publicHolidays !== "open" && isPublicHoliday(date)) {
      if (input.publicHolidays === "call" && rows.some((r) => !closureFor(input.closures, iso, r.service))) {
        holidays.push(dayName(date, now.y));
      }
      continue;
    }

    const services = {} as Record<ServiceName, ServiceChoice>;
    for (const name of SERVICES) {
      const row = rows.find((r) => r.service === name);
      const closure = row && closureFor(input.closures, iso, name);
      if (!row) {
        services[name] = { available: false, reason: `Pas de service le ${DAYS[wd]} ${name}.` };
      } else if (closure) {
        services[name] = { available: false, reason: closedReason(closure.kind, name) };
      } else {
        const all = slotsBetween(row.open, row.close, input.slotMinutes);
        const slots = offset === 0 ? all.filter((t) => toMinutes(t) > now.minutes) : all;
        services[name] = slots.length
          ? { available: true, open: row.open, close: row.close, slots }
          : { available: false, reason: `Plus d'arrivée possible ce ${name}.` };
      }
    }
    if (!SERVICES.some((s) => services[s].available)) continue;

    const prefix = offset === 0 ? "aujourd'hui, " : offset === 1 ? "demain, " : "";
    days.push({
      iso,
      offset,
      label: capitalize(prefix + dayName(date, now.y)),
      longLabel: dayName(date, now.y, true),
      services,
    });
  }
  return { days, holidays };
}

/** True when the chosen arrival time today is closer than the lead time (the form then says « appelez-nous »). */
export function isTooSoon(day: BookingDay | undefined, slot: string, nowMs: number, leadMinutes: number): boolean {
  if (!day || day.offset !== 0 || !slot) return false;
  return toMinutes(slot) - parisNow(nowMs).minutes < leadMinutes;
}

/** Widest window per service across the week: the arrival times offered when JavaScript is off. */
export function serviceWindows(services: ServiceRow[], step: number): { service: ServiceName; open: string; close: string; slots: string[] }[] {
  return SERVICES.flatMap((name) => {
    const rows = services.filter((s) => s.service === name);
    if (!rows.length) return [];
    const open = fromMinutes(Math.min(...rows.map((r) => toMinutes(r.open))));
    const close = fromMinutes(Math.max(...rows.map((r) => toMinutes(r.close))));
    return [{ service: name, open, close, slots: slotsBetween(open, close, step) }];
  });
}

/** « du mardi au samedi », « le mardi et le jeudi », « le samedi »: the days a service runs, for hints. */
export function weekdaysPhrase(services: ServiceRow[], service: ServiceName): string {
  const days = [...new Set(services.filter((s) => s.service === service).map((s) => s.day))].sort((a, b) => a - b);
  if (!days.length) return "";
  const contiguous = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  if (days.length >= 3 && contiguous) return `du ${DAYS[days[0]]} au ${DAYS[days[days.length - 1]]}`;
  const list = days.map((d) => `le ${DAYS[d]}`);
  return list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} et ${list[list.length - 1]}`;
}
