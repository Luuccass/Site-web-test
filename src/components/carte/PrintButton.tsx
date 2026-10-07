"use client";

import { useEffect } from "react";

// « Imprimer la carte »: opens the browser's print dialog (the print stylesheet lays the page out
// like a printed menu). With `expandDetails`, every closed <details> on the page opens for printing
// (button or Ctrl+P) and closes again afterwards.
export function PrintButton({ label, expandDetails = false, className = "" }: { label: string; expandDetails?: boolean; className?: string }) {
  useEffect(() => {
    if (!expandDetails) return;
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = Array.from(document.querySelectorAll<HTMLDetailsElement>("main details:not([open])"));
      opened.forEach((d) => (d.open = true));
    };
    const after = () => {
      opened.forEach((d) => (d.open = false));
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [expandDetails]);

  return (
    <button type="button" className={`btn btn-line no-print ${className}`} onClick={() => window.print()}>
      {label}
    </button>
  );
}
