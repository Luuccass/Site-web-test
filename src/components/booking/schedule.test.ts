import { describe, expect, it } from "vitest";
import hours from "../../../content/hours.json";
import { buildCalendar, isTooSoon, serviceWindows, slotsBetween, weekdaysPhrase, type CalendarInput, type ServiceRow } from "./schedule";
import { isPhone, validateAll, validateField, type Values } from "./validation";

const services = hours.services as ServiceRow[];
const base: CalendarInput = { services, closures: [], publicHolidays: "call", horizonDays: 30, slotMinutes: 15 };
// Paris local time -> epoch ms (October 2026 is UTC+2 until the 25th, then UTC+1).
const at = (isoLocal: string, offset = "+02:00") => Date.parse(isoLocal + offset);
const n = (s: string) => s.replace(/ /g, " ");

describe("buildCalendar", () => {
  it("Tuesday morning: today first, lunch only, every 15 minutes up to closing", () => {
    const { days } = buildCalendar(base, at("2026-10-06T10:00:00"));
    expect(days[0].iso).toBe("2026-10-06");
    expect(days[0].label).toBe("Aujourd'hui, mardi 6 octobre");
    expect(days[1].label).toBe("Demain, mercredi 7 octobre");
    const midi = days[0].services.midi;
    expect(midi.available && midi.slots).toEqual([
      "11:30",
      "11:45",
      "12:00",
      "12:15",
      "12:30",
      "12:45",
      "13:00",
      "13:15",
      "13:30",
      "13:45",
    ]);
    const soir = days[0].services.soir;
    expect(!soir.available && soir.reason).toBe("Pas de service le mardi soir.");
  });

  it("skips Sunday, Monday and days without any time left", () => {
    const { days } = buildCalendar(base, at("2026-10-06T13:50:00"));
    expect(days[0].iso).toBe("2026-10-07");
    expect(days.some((d) => d.iso === "2026-10-11" || d.iso === "2026-10-12")).toBe(false);
  });

  it("today keeps only future arrival times", () => {
    const { days } = buildCalendar(base, at("2026-10-08T12:20:00"));
    const midi = days[0].services.midi;
    expect(midi.available && midi.slots[0]).toBe("12:30");
  });

  it("stops at the horizon and stays on calendar dates across the DST change", () => {
    const { days } = buildCalendar(base, at("2026-10-24T12:00:00"));
    expect(days[0].iso).toBe("2026-10-24");
    expect(days.some((d) => d.iso === "2026-10-27")).toBe(true);
    expect(days[days.length - 1].iso <= "2026-11-23").toBe(true);
    expect(days.every((d) => d.services.midi.available || d.services.soir.available)).toBe(true);
  });

  it("lists public holidays apart (phone only) when the policy is « call »", () => {
    const cal = buildCalendar(base, at("2026-10-20T10:00:00"));
    expect(cal.days.some((d) => d.iso === "2026-11-11")).toBe(false);
    expect(cal.holidays).toEqual(["mercredi 11 novembre"]);
  });

  it("closures: whole days removed, single services disabled with a reason", () => {
    const cal = buildCalendar(
      {
        ...base,
        closures: [
          { from: "2026-10-13", to: "2026-10-15", kind: "conges" },
          { from: "2026-10-16", to: "2026-10-16", kind: "privatisation", services: ["soir"] },
        ],
      },
      at("2026-10-12T10:00:00"),
    );
    expect(cal.days.some((d) => ["2026-10-13", "2026-10-14", "2026-10-15"].includes(d.iso))).toBe(false);
    const friday = cal.days.find((d) => d.iso === "2026-10-16");
    expect(friday?.services.midi.available).toBe(true);
    expect(friday && !friday.services.soir.available && friday.services.soir.reason).toBe("Restaurant privatisé ce soir-là.");
  });
});

describe("same-day rule", () => {
  it("under the lead time is too soon, from the lead time on it is allowed", () => {
    const now = at("2026-10-06T11:00:00");
    const today = buildCalendar(base, now).days[0];
    expect(isTooSoon(today, "11:45", now, 60)).toBe(true);
    expect(isTooSoon(today, "12:00", now, 60)).toBe(false);
    const tomorrow = buildCalendar(base, now).days[1];
    expect(isTooSoon(tomorrow, "11:30", now, 60)).toBe(false);
  });
});

describe("helpers", () => {
  it("slots exclude the closing time", () => {
    expect(slotsBetween("19:30", "21:30", 15).at(-1)).toBe("21:15");
  });
  it("no-JS windows cover the whole week", () => {
    expect(serviceWindows(services, 15).map((w) => `${w.service} ${w.open}-${w.close}`)).toEqual(["midi 11:30-14:00", "soir 19:30-21:30"]);
  });
  it("weekday phrases", () => {
    expect(weekdaysPhrase(services, "midi")).toBe("du mardi au samedi");
    expect(weekdaysPhrase(services, "soir")).toBe("du jeudi au samedi");
  });
  it("phone numbers", () => {
    expect(isPhone("06 12 34 56 78")).toBe(true);
    expect(isPhone("06.12.34.56.78")).toBe(true);
    expect(isPhone("+33 6 12 34 56 78")).toBe(true);
    expect(isPhone("06 12 34")).toBe(false);
    expect(isPhone("abc")).toBe(false);
  });
});

describe("validation", () => {
  const now = at("2026-10-06T11:00:00");
  const ctx = { days: buildCalendar(base, now).days, nowMs: now, leadMinutes: 60, maxCovers: 20, phone: "04 78 66 19 57" };
  const ok: Values = {
    date: "2026-10-08",
    service: "soir",
    heure: "19:30",
    couverts: "4",
    nom: "Martin",
    telephone: "06 12 34 56 78",
    email: "",
  };

  it("a complete request passes", () => {
    expect(validateAll(ok, ctx)).toEqual({});
  });
  it("reports every missing field in form order", () => {
    const errors = validateAll({ date: "", service: "", heure: "", couverts: "", nom: "", telephone: "", email: "" }, ctx);
    expect(Object.keys(errors)).toEqual(["date", "service", "heure", "couverts", "nom", "telephone"]);
  });
  it("blocks a same-day table under one hour and points to the phone", () => {
    expect(n(validateField("heure", { ...ok, date: "2026-10-06", service: "midi", heure: "11:45" }, ctx) ?? "")).toBe(
      "Pour une table dans moins d'une heure, appelez-nous.",
    );
    expect(validateField("heure", { ...ok, date: "2026-10-06", service: "midi", heure: "12:00" }, ctx)).toBeUndefined();
  });
  it("party size limits and e-mail format", () => {
    expect(validateField("couverts", { ...ok, couverts: "0" }, ctx)).toBeDefined();
    expect(n(validateField("couverts", { ...ok, couverts: "21" }, ctx) ?? "")).toContain("appelez-nous");
    expect(validateField("email", { ...ok, email: "nom@exemple" }, ctx)).toBeDefined();
    expect(validateField("email", { ...ok, email: "nom@exemple.fr" }, ctx)).toBeUndefined();
  });
  it("a closed service is refused with its reason", () => {
    expect(validateField("service", { ...ok, date: "2026-10-07", service: "soir" }, ctx)).toBe("Pas de service le mercredi soir.");
  });
});
