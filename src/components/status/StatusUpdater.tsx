"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { applyStatus } from "@/lib/apply-status";
import type { HoursData } from "@/lib/status";
import { computeStatus } from "@/lib/status";

// Keeps the live status right after client navigations and as time passes (checked every 30 s,
// paused while the tab is hidden). The text only changes at state boundaries.
export function StatusUpdater({ data }: { data: HoursData }) {
  const pathname = usePathname();
  useEffect(() => {
    const run = () => applyStatus(computeStatus(data, Date.now()));
    run();
    let timer = window.setInterval(run, 30_000);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (document.visibilityState === "visible") {
        run();
        timer = window.setInterval(run, 30_000);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname, data]);
  return null;
}
