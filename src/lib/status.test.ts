import { describe, expect, it } from "vitest";
import hours from "../../content/hours.json";
import { computeStatus, type HoursData } from "./status";

const base: HoursData = {
  verifiedThrough: "2026-12-31",
  services: hours.services as HoursData["services"],
  closures: [],
  publicHolidays: "call",
  phone: "04 78 66 19 57",
  priceFrom: 22,
  priceTo: 33,
  formules: "2 plats 21 €, 3 plats 25 €",
};
// Paris local time -> epoch ms (October 2026 is UTC+2 until the 25th, then UTC+1).
const at = (isoLocal: string, offset = "+02:00") => Date.parse(isoLocal + offset);
const n = (s: string) => s.replace(/ /g, " ");

describe("computeStatus", () => {
  it("Tuesday before lunch: open at noon, call first", () => {
    const s = computeStatus(base, at("2026-10-06T10:00:00"));
    expect(n(s.line1)).toBe("Ouvert ce midi");
    expect(n(s.line2)).toBe("de 11 h 30 à 14 h");
    expect(s.primary).toBe("call");
    expect(n(s.priceLine)).toContain("Formules du midi");
  });
  it("Tuesday during lunch", () => {
    const s = computeStatus(base, at("2026-10-06T12:15:00"));
    expect(n(s.line1)).toBe("Ouvert ce midi");
    expect(n(s.line2)).toBe("service jusqu'à 14 h");
  });
  it("Tuesday afternoon: closed tonight, back tomorrow noon, book first", () => {
    const s = computeStatus(base, at("2026-10-06T15:00:00"));
    expect(n(s.line1)).toBe("Fermé ce soir");
    expect(n(s.line2)).toBe("demain midi dès 11 h 30");
    expect(s.primary).toBe("book");
    expect(n(s.priceLine)).toContain("À la carte");
  });
  it("Thursday afternoon: between services", () => {
    const s = computeStatus(base, at("2026-10-08T15:30:00"));
    expect(n(s.line1)).toBe("Fermé cet après-midi");
    expect(n(s.line2)).toBe("ce soir dès 19 h 30");
  });
  it("Friday evening during dinner", () => {
    const s = computeStatus(base, at("2026-10-09T20:00:00"));
    expect(n(s.line1)).toBe("Ouvert ce soir");
    expect(n(s.line2)).toBe("service jusqu'à 21 h 30");
  });
  it("Saturday night after dinner: reopens Tuesday", () => {
    const s = computeStatus(base, at("2026-10-10T22:30:00"));
    expect(n(s.line1)).toBe("Fermé ce soir");
    expect(n(s.line2)).toBe("réouverture mardi à 11 h 30");
  });
  it("Sunday and Monday", () => {
    expect(n(computeStatus(base, at("2026-10-11T12:00:00")).line1)).toBe("Fermé aujourd'hui");
    expect(n(computeStatus(base, at("2026-10-11T12:00:00")).line2)).toBe("réouverture mardi à 11 h 30");
    expect(n(computeStatus(base, at("2026-10-12T12:00:00")).line2)).toBe("demain midi dès 11 h 30");
  });
  it("Public holiday on an open day asks to call", () => {
    // 11 November 2026 is a Wednesday.
    const s = computeStatus(base, at("2026-11-11T10:00:00", "+01:00"));
    expect(s.state).toBe("holiday");
    expect(s.primary).toBe("call");
  });
  it("Congés", () => {
    const data = { ...base, closures: [{ from: "2026-08-08", to: "2026-08-22", kind: "conges" as const }] };
    const s = computeStatus(data, at("2026-08-12T12:00:00"));
    expect(n(s.line1)).toBe("En congés jusqu'au 22 août");
    expect(n(s.line2)).toBe("réouverture le mardi 25 août");
  });
  it("Privatised dinner", () => {
    const data = { ...base, closures: [{ from: "2026-10-09", to: "2026-10-09", kind: "privatisation" as const, services: ["soir" as const] }] };
    const s = computeStatus(data, at("2026-10-09T16:00:00"));
    expect(n(s.line1)).toBe("Fermé ce soir (privatisation)");
  });
  it("Expired hours make no open/closed claim", () => {
    const s = computeStatus(base, at("2027-01-05T12:00:00", "+01:00"));
    expect(s.state).toBe("unverified");
  });
  it("DST change night (25 October 2026, 03:00 -> 02:00)", () => {
    const s = computeStatus(base, Date.parse("2026-10-25T01:30:00Z"));
    expect(n(s.line1)).toBe("Fermé aujourd'hui");
  });
  it("Runs once stringified (inline pre-paint script)", () => {
    const fn = new Function("return " + computeStatus.toString())();
    expect(fn(base, at("2026-10-06T12:15:00")).state).toBe("open");
  });
});
