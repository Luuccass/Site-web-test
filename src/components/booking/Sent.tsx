import type { Ref } from "react";
import { nobreak, SENT_CONFIRM, SENT_FALLBACK, SENT_TITLE } from "./copy";

export type Recap = { date: string; service: string; heure: string; couverts: string };

// « Demande envoyée, pas encore confirmée »: the success panel of the form (JS) and the content of
// /reserver/merci/ (no JS). No hooks, so it renders on the server and in the client form alike.
export function Sent({
  phone,
  recap,
  as: Heading = "h2",
  headingRef,
}: {
  phone: { display: string; e164: string };
  recap?: Recap;
  as?: "h1" | "h2";
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div>
      <Heading
        ref={headingRef}
        tabIndex={-1}
        className={`outline-none ${Heading === "h1" ? "text-[length:var(--text-h1)]" : "text-[length:var(--text-h2)]"}`}
      >
        {SENT_TITLE}
      </Heading>
      <p className="measure mt-6 text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">{SENT_CONFIRM}</p>
      <p className="measure mt-4">
        {SENT_FALLBACK}{" "}
        <a href={`tel:${phone.e164}`} className="tnum underline">
          {nobreak(phone.display)}
        </a>
        .
      </p>
      {recap ? (
        <dl className="mt-10 grid max-w-[34rem] grid-cols-[auto_1fr] gap-x-8 border-t border-line">
          {(
            [
              ["Date", recap.date],
              ["Service", recap.service],
              ["Heure", recap.heure],
              ["Couverts", recap.couverts],
            ] as const
          ).map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="border-b border-line py-3 text-ink-soft">{term}</dt>
              <dd className="tnum border-b border-line py-3">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
