"use client";

import { useSyncExternalStore } from "react";

// The current minute on the client, `null` during prerender and hydration. The static HTML therefore
// never depends on the time of the build; the live calendar appears right after hydration.

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const minuteNow = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => null;

export function useMinute(): number | null {
  return useSyncExternalStore(subscribe, minuteNow, serverMinute);
}
