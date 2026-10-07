// Live opening status, computed in Europe/Paris time.
//
// `computeStatus` is deliberately self-contained (no imports, no closures, ES2017 syntax): its source
// is also inlined as a tiny pre-paint script (see components/status/StatusScript.tsx) so the status is
// right before React hydrates. Keep it that way.

export type ServiceName = "midi" | "soir";

export type HoursData = {
  verifiedThrough: string; // YYYY-MM-DD
  services: { day: number; service: ServiceName; open: string; close: string }[]; // day: 1 = Monday … 7 = Sunday
  closures: { from: string; to: string; kind: "conges" | "fermeture" | "privatisation"; services?: ServiceName[] }[];
  publicHolidays: "call" | "open" | "closed";
  phone: string;
  priceFrom: number;
  priceTo: number;
  formules: string; // e.g. "2 plats 21 € · 3 plats 25 €"
};

export type Status = {
  state: "open" | "upcoming" | "between" | "closed" | "conges" | "holiday" | "unverified";
  line1: string;
  line2: string;
  primary: "call" | "book";
  callLabel: string;
  priceLine: string;
  day?: number; // Paris weekday, 1 = Monday … 7 = Sunday (set by computeStatus)
};

export function computeStatus(data: HoursData, nowMs: number): Status {
  var result = computeStatusInner(data, nowMs);
  var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short" }).format(new Date(nowMs));
  result.day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p) + 1;
  return result;

  function computeStatusInner(data: HoursData, nowMs: number): Status {
  var NBSP = " ";
  var DAYS = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  var MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function pad(n: number) {
    return (n < 10 ? "0" : "") + n;
  }
  function parisParts(ms: number) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(ms));
    var o: Record<string, number> = {};
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type !== "literal") o[parts[i].type] = parseInt(parts[i].value, 10);
    }
    return { y: o.year, m: o.month, d: o.day, minutes: o.hour * 60 + o.minute };
  }
  function iso(y: number, m: number, d: number) {
    return y + "-" + pad(m) + "-" + pad(d);
  }
  // Day arithmetic on calendar dates (UTC noon avoids DST edges).
  function shift(y: number, m: number, d: number, days: number) {
    var t = new Date(Date.UTC(y, m - 1, d, 12) + days * 86400000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function weekday(y: number, m: number, d: number) {
    var w = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
    return w === 0 ? 7 : w;
  }
  function easter(y: number) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var mm = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * mm + 114) / 31);
    var day = ((h + l - 7 * mm + 114) % 31) + 1;
    return { y: y, m: month, d: day };
  }
  function isHoliday(y: number, m: number, d: number) {
    var fixed = ["01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"];
    if (fixed.indexOf(pad(m) + "-" + pad(d)) >= 0) return true;
    var e = easter(y);
    var offsets = [1, 39, 50]; // lundi de Pâques, Ascension, lundi de Pentecôte
    for (var i = 0; i < offsets.length; i++) {
      var h = shift(e.y, e.m, e.d, offsets[i]);
      if (h.m === m && h.d === d) return true;
    }
    return false;
  }
  function toMin(hhmm: string) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function fmtTime(hhmm: string) {
    var p = hhmm.split(":");
    var h = parseInt(p[0], 10);
    return p[1] === "00" ? h + NBSP + "h" : h + NBSP + "h" + NBSP + p[1];
  }
  function closureFor(dateIso: string, service: ServiceName | null) {
    for (var i = 0; i < data.closures.length; i++) {
      var c = data.closures[i];
      if (dateIso >= c.from && dateIso <= c.to) {
        if (!c.services || !service || c.services.indexOf(service) >= 0) return c;
      }
    }
    return null;
  }
  // Services open on a given date (closures and holiday policy applied).
  function servicesOn(y: number, m: number, d: number) {
    var date = iso(y, m, d);
    var wd = weekday(y, m, d);
    var out = [];
    for (var i = 0; i < data.services.length; i++) {
      var s = data.services[i];
      if (s.day !== wd) continue;
      if (closureFor(date, s.service)) continue;
      if (data.publicHolidays === "closed" && isHoliday(y, m, d)) continue;
      out.push(s);
    }
    out.sort(function (a, b) {
      return toMin(a.open) - toMin(b.open);
    });
    return out;
  }
  function formules(m: number, d: number, y: number, minutes: number) {
    var wd = weekday(y, m, d);
    return wd >= 2 && wd <= 5 && minutes < 14 * 60
      ? "Formules du midi : " + data.formules
      : "À la carte : plats de " + data.priceFrom + NBSP + "à " + data.priceTo + NBSP + "€";
  }

  var now = parisParts(nowMs);
  var today = iso(now.y, now.m, now.d);
  var priceLine = formules(now.m, now.d, now.y, now.minutes);
  var base = { primary: "book" as const, callLabel: "Appeler", priceLine: priceLine };

  if (today > data.verifiedThrough) {
    return Object.assign({}, base, {
      state: "unverified" as const,
      line1: "Horaires habituels",
      line2: "appelez pour confirmer au " + data.phone,
    });
  }

  var conges = closureFor(today, null);
  if (conges && conges.kind === "conges") {
    var back = shift(parseInt(conges.to.slice(0, 4), 10), parseInt(conges.to.slice(5, 7), 10), parseInt(conges.to.slice(8, 10), 10), 1);
    for (var k = 0; k < 60 && !servicesOn(back.y, back.m, back.d).length; k++) back = shift(back.y, back.m, back.d, 1);
    return Object.assign({}, base, {
      state: "conges" as const,
      line1: "En congés jusqu'au " + parseInt(conges.to.slice(8, 10), 10) + " " + MONTHS[parseInt(conges.to.slice(5, 7), 10) - 1],
      line2: "réouverture le " + DAYS[weekday(back.y, back.m, back.d)] + " " + back.d + " " + MONTHS[back.m - 1],
    });
  }

  var todays = servicesOn(now.y, now.m, now.d);
  if (todays.length && data.publicHolidays === "call" && isHoliday(now.y, now.m, now.d)) {
    return Object.assign({}, base, {
      state: "holiday" as const,
      primary: "call" as const,
      line1: "Jour férié",
      line2: "appelez pour vérifier au " + data.phone,
    });
  }

  var hadServiceToday = false;
  for (var j = 0; j < data.services.length; j++) {
    if (data.services[j].day === weekday(now.y, now.m, now.d)) hadServiceToday = true;
  }

  for (var s = 0; s < todays.length; s++) {
    var sv = todays[s];
    var open = toMin(sv.open), close = toMin(sv.close);
    var when = sv.service === "midi" ? "ce midi" : "ce soir";
    if (now.minutes >= open && now.minutes < close) {
      return { state: "open", line1: "Ouvert " + when, line2: "service jusqu'à " + fmtTime(sv.close), primary: "call", callLabel: "Appeler pour " + when, priceLine: priceLine };
    }
    if (now.minutes < open) {
      var earlier = s > 0 || (sv.service === "soir" && now.minutes >= 14 * 60);
      if (earlier) {
        return { state: "between", line1: "Fermé cet après-midi", line2: when + " dès " + fmtTime(sv.open), primary: "call", callLabel: "Appeler pour " + when, priceLine: priceLine };
      }
      return { state: "upcoming", line1: "Ouvert " + when, line2: "de " + fmtTime(sv.open) + " à " + fmtTime(sv.close), primary: "call", callLabel: "Appeler pour " + when, priceLine: priceLine };
    }
  }

  // Nothing left today: find the next open service.
  var privatised = closureFor(today, "soir");
  for (var n = 1; n <= 60; n++) {
    var day = shift(now.y, now.m, now.d, n);
    var list = servicesOn(day.y, day.m, day.d);
    if (!list.length) continue;
    var next = list[0];
    var nextWhen = next.service === "midi" ? "midi" : "soir";
    var label =
      n === 1
        ? "demain " + nextWhen + " dès " + fmtTime(next.open)
        : n < 7
          ? "réouverture " + DAYS[weekday(day.y, day.m, day.d)] + " à " + fmtTime(next.open)
          : "réouverture le " + DAYS[weekday(day.y, day.m, day.d)] + " " + day.d + " " + MONTHS[day.m - 1];
    var line1 = privatised && privatised.kind === "privatisation" ? "Fermé ce soir (privatisation)" : hadServiceToday ? "Fermé ce soir" : "Fermé aujourd'hui";
    return Object.assign({}, base, { state: "closed" as const, line1: line1, line2: label });
  }
  return Object.assign({}, base, { state: "closed" as const, line1: "Fermé", line2: "appelez au " + data.phone });
}
}
