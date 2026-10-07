/* eslint-disable no-var -- stringified into the pre-paint inline script (see StatusScript): plain ES5-style declarations on purpose */
import type { Status } from "./status";

// Writes a computed status into every element that displays it. Self-contained (stringified into the
// inline pre-paint script), so: no imports, no closures, ES2017 syntax.
export function applyStatus(s: Status) {
  var root = document.documentElement;
  root.setAttribute("data-primary", s.primary);
  root.setAttribute("data-state", s.state);
  if (s.day) root.setAttribute("data-today", String(s.day));
  var set = function (sel: string, text: string) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].textContent = text;
  };
  set("[data-s1]", s.line1);
  set("[data-s2]", s.line2);
  set("[data-call-label]", s.callLabel);
  set("[data-price-line]", s.priceLine);
}
