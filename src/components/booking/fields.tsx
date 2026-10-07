import type { ReactNode } from "react";

// Building blocks of the booking form: one look for every field (white ground, field-grey border,
// error state that never changes the box size).

export const fieldId = (name: string) => `reservation-${name}`;

/** Field look without a width (for inline controls). */
export const controlBase =
  "block min-h-12 rounded-[2px] border border-field bg-paper px-4 py-2.5 text-ink placeholder:text-ink-soft " +
  "aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[inset_0_0_0_1px_var(--color-error)]";
export const controlClass = `${controlBase} w-full`;

/** ids for aria-describedby: hint first, then the error (only when present). */
export function describedBy(name: string, opts: { hint?: boolean; error?: boolean; extra?: string[] } = {}) {
  const ids = [opts.hint ? `${fieldId(name)}-hint` : "", opts.error ? `${fieldId(name)}-error` : "", ...(opts.extra ?? [])].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function Label({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label htmlFor={fieldId(name)} className="block font-medium">
      {children}
    </label>
  );
}

export function Optional() {
  return <span className="font-normal text-ink-soft"> (facultatif)</span>;
}

export function Hint({ name, children }: { name: string; children: ReactNode }) {
  return (
    <p id={`${fieldId(name)}-hint`} className="mt-1 text-[1rem] text-ink-soft">
      {children}
    </p>
  );
}

export function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${fieldId(name)}-error`} className="mt-2 text-[1rem] font-medium text-error">
      {message}
    </p>
  );
}

/** Native select with a drawn chevron (the native arrow is removed for a consistent height). */
export function SelectFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-2">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 6l5 5 5-5" />
      </svg>
    </div>
  );
}

export const selectClass = `${controlClass} appearance-none pr-12`;
