"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ALLERGY_LINE, DEFAULT_SUBJECT, nobreak, OCCASIONS, PRIVACY_LINE } from "./copy";
import { controlBase, controlClass, describedBy, FieldError, fieldId, Hint, Label, Optional, SelectFrame, selectClass } from "./fields";
import { Sent, type Recap } from "./Sent";
import {
  buildCalendar,
  isTooSoon,
  serviceWindows,
  SERVICES,
  timeLabel,
  weekdaysPhrase,
  type CalendarInput,
  type ServiceName,
} from "./schedule";
import { useMinute } from "./useClock";
import {
  FIELD_ORDER,
  tooSoonMessage,
  validateAll,
  validateField,
  type CheckContext,
  type Errors,
  type FieldName,
  type Values,
} from "./validation";

// The booking request form (Netlify Forms).
//
// Without JavaScript it is a plain POST form: a date picker, every arrival time of the week, the group
// questions always visible; Netlify stores the request and shows /reserver/merci/. With JavaScript the
// same markup is enhanced after hydration: a <select> of the next open dates (Europe/Paris, closures
// and closed days removed), closed services disabled with their reason, arrival times of the chosen
// service only, the same-day rule, group questions only from the group threshold, inline validation,
// and a fetch submission that keeps the visitor on the page.
//
// Every field name must exist in the static HTML: Netlify registers the form fields at deploy time.

export type BookingFormProps = {
  formName: string;
  calendar: CalendarInput;
  leadMinutes: number;
  groupThreshold: number;
  maxCovers: number;
  phone: { display: string; e164: string };
};

type Phase = "idle" | "sending" | "failed" | "sent";

const SERVICE_LABEL: Record<ServiceName, string> = { midi: "Midi", soir: "Soir" };
const CONTROLLED: FieldName[] = ["date", "service", "heure", "couverts"];
const NNBSP = " ";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const focusOnMount = (el: HTMLElement | null) => el?.focus();

export function BookingForm({ formName, calendar: input, leadMinutes, groupThreshold, maxCovers, phone }: BookingFormProps) {
  const minute = useMinute();
  const live = minute !== null; // false in the static HTML (no JS) and during hydration
  const nowMs = (minute ?? 0) * 60_000;
  const calendar = useMemo(() => (minute === null ? null : buildCalendar(input, minute * 60_000)), [input, minute]);
  const windows = useMemo(() => serviceWindows(input.services, input.slotMinutes), [input]);

  const [date, setDate] = useState("");
  const [service, setService] = useState<ServiceName | "">("");
  const [heure, setHeure] = useState("");
  const [couverts, setCouverts] = useState("2");
  // Spoken after a −/+ press (the number field keeps focus elsewhere, so its new value is not read out).
  const [stepNote, setStepNote] = useState("");
  // Fields with an error to show. Messages of the date/service/time/party fields are recomputed at each
  // render (they follow the clock and the other choices); text fields keep the message of their last check.
  const [flags, setFlags] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, true>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [recap, setRecap] = useState<Recap | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  // Effective choices: values the calendar no longer offers fall back to « not chosen ».
  const day = calendar?.days.find((d) => d.iso === date);
  const effDate = day ? date : "";
  const openServices = day ? SERVICES.filter((s) => day.services[s].available) : [];
  const effService: ServiceName | "" =
    service && (!day || day.services[service].available) ? service : openServices.length === 1 ? openServices[0] : "";
  const choice = day && effService ? day.services[effService] : undefined;
  const slots = choice?.available ? choice.slots : [];
  const effHeure = slots.includes(heure) ? heure : "";
  const tooSoon = live && isTooSoon(day, effHeure, nowMs, leadMinutes);
  const sameDay = day?.offset === 0;
  const covers = /^\d+$/.test(couverts) ? Number(couverts) : 0;
  const groupOpen = !live || covers >= groupThreshold;

  const context: CheckContext = { days: calendar?.days ?? [], nowMs, leadMinutes, maxCovers, phone: phone.display };
  const controlledValues = { date: effDate, service: effService, heure: effHeure, couverts };

  const shown: Errors = {};
  for (const name of FIELD_ORDER) {
    if (!flags[name]) continue;
    shown[name] = CONTROLLED.includes(name)
      ? validateField(name, { ...controlledValues, nom: "", telephone: "", email: "" }, context)
      : flags[name];
  }
  const summary = showSummary ? FIELD_ORDER.filter((name) => shown[name]) : [];

  function readValues(): Values {
    const els = formRef.current?.elements;
    const text = (name: string) => {
      const el = els?.namedItem(name);
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value.trim() : "";
    };
    return { ...controlledValues, nom: text("nom"), telephone: text("telephone"), email: text("email") };
  }

  function setFlag(name: FieldName, message: string | undefined) {
    setFlags((prev) => ({ ...prev, [name]: message }));
  }

  // On blur: check a field once the visitor has typed or chosen something in it (empty untouched fields
  // stay quiet until submit), or when it already shows an error.
  function onBlurField(name: FieldName) {
    const values = readValues();
    if (touched[name] || flags[name] || values[name]) setFlag(name, validateField(name, values, context));
  }

  // While typing: clear an error as soon as the value is fixed (new errors wait for blur).
  function onTextInput(name: FieldName) {
    if (!touched[name]) setTouched((t) => ({ ...t, [name]: true }));
    if (flags[name] && !validateField(name, readValues(), context)) setFlag(name, undefined);
  }

  function touch(name: FieldName) {
    if (!touched[name]) setTouched((t) => ({ ...t, [name]: true }));
  }

  function stepCovers(delta: number) {
    const next = Math.min(maxCovers, Math.max(1, (covers || 0) + delta));
    setCouverts(String(next));
    setStepNote(next === 1 ? "1 personne." : `${next} personnes.`);
    touch("couverts");
  }

  function focusField(name: FieldName) {
    // For the service, the checked radio first (a comma selector would return the first one in document order).
    const target =
      name === "service"
        ? (formRef.current?.querySelector<HTMLInputElement>('input[name="service"]:checked') ??
          formRef.current?.querySelector<HTMLInputElement>('input[name="service"]:not(:disabled)'))
        : document.getElementById(fieldId(name));
    target?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "sending") return;
    const form = event.currentTarget;
    const values = readValues();
    const errors = validateAll(values, context);
    setFlags(errors);
    if (Object.keys(errors).length || !day || !effService || !effHeure) {
      setShowSummary(true);
      if (phase === "failed") setPhase("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowSummary(false);

    const timeText = timeLabel(effHeure).replace(/ /g, " ");
    const subject = `${sameDay ? "AUJOURD'HUI — " : ""}Demande de réservation : ${day.longLabel}, ${effService} ${timeText}, ${covers} pers.`;
    const body = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (typeof value === "string") body.append(key, value);
    body.set("subject", subject);
    body.set("jour-meme", sameDay ? "oui" : "non");

    setPhase("sending");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setRecap({
        date: capitalize(day.longLabel),
        service: SERVICE_LABEL[effService],
        heure: timeLabel(effHeure),
        couverts: covers === 1 ? "1 personne" : `${covers} personnes`,
      });
      setPhase("sent");
    } catch {
      setPhase("failed");
    } finally {
      window.clearTimeout(timer);
    }
  }

  if (phase === "sent" && recap) {
    return (
      <div>
        <Sent phone={phone} recap={recap} headingRef={focusOnMount} />
        <p className="mt-10">
          <Link href="/" className="btn btn-line">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    );
  }

  const phoneLink = (
    <a href={`tel:${phone.e164}`} className="tnum underline">
      {nobreak(phone.display)}
    </a>
  );
  const midiDays = weekdaysPhrase(input.services, "midi");
  const soirDays = weekdaysPhrase(input.services, "soir");
  const holidays = calendar?.holidays ?? [];
  const legendClass = "float-left w-full text-[length:var(--text-h3)] font-normal leading-tight";
  // Pre-paint with JS (html.js-booking, set by the page): hide what only the no-JS version shows.
  const noJsOnly = live ? "" : "[.js-booking_&]:hidden";
  const jsOnly = live ? "" : "hidden [.js-booking_&]:inline-flex";

  return (
    <form
      ref={formRef}
      name={formName}
      method="POST"
      action="/reserver/merci/"
      data-netlify="true"
      netlify-honeypot="bot-field"
      noValidate={live}
      onSubmit={onSubmit}
      aria-describedby="reservation-intro"
    >
      <input type="hidden" name="form-name" value={formName} />
      <input type="hidden" name="subject" value={DEFAULT_SUBJECT} data-remove-prefix />
      <input type="hidden" name="jour-meme" value={live && day ? (sameDay ? "oui" : "non") : ""} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="reservation-bot-field">Ne pas remplir ce champ</label>
        <input id="reservation-bot-field" name="bot-field" tabIndex={-1} autoComplete="off" />
      </div>

      {summary.length ? (
        <section
          ref={summaryRef}
          tabIndex={-1}
          aria-labelledby="reservation-erreurs"
          className="mb-10 border-2 border-error px-5 py-5 outline-offset-4 sm:px-6"
        >
          <h2 id="reservation-erreurs" className="text-[length:var(--text-h3)] font-medium text-error">
            Vérifiez votre demande
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-error">
            {summary.map((name) => (
              <li key={name}>
                <a
                  href={`#${name === "service" ? `${fieldId("service")}-${effService || "midi"}` : fieldId(name)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    focusField(name);
                  }}
                  className="underline"
                >
                  {shown[name]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p id="reservation-intro" className="text-ink-soft">
        Tous les champs sont obligatoires, sauf mention «{NNBSP}facultatif{NNBSP}».
      </p>

      <fieldset className="mt-8">
        <legend className={legendClass}>Votre table</legend>
        <div className="clear-both grid gap-7 pt-5">
          {/* Date */}
          <div>
            <Label name="date">Date</Label>
            {calendar ? (
              <SelectFrame>
                <select
                  id={fieldId("date")}
                  name="date"
                  required
                  value={effDate}
                  onChange={(e) => {
                    setDate(e.target.value);
                    touch("date");
                  }}
                  onBlur={() => onBlurField("date")}
                  aria-invalid={shown.date ? true : undefined}
                  aria-describedby={describedBy("date", { hint: true, error: !!shown.date })}
                  className={selectClass}
                >
                  <option value="">Choisir une date</option>
                  {calendar.days.map((d) => (
                    <option key={d.iso} value={d.iso}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </SelectFrame>
            ) : (
              <input
                id={fieldId("date")}
                name="date"
                type="date"
                required
                aria-describedby={describedBy("date", { hint: true })}
                className={`${controlClass} mt-2`}
              />
            )}
            <Hint name="date">
              Midi {midiDays}
              {soirDays ? `, soir ${soirDays}` : ""}. Demandes jusqu&apos;à {input.horizonDays}
              {NNBSP}jours à l&apos;avance.
              {holidays.length ? (
                <>
                  {" "}
                  {holidays.length === 1 ? `Le ${holidays[0]} est férié` : `Jours fériés (${holidays.join(", ")})`}
                  {NNBSP}: appelez-nous pour savoir si le restaurant est ouvert.
                </>
              ) : null}
            </Hint>
            {sameDay && !tooSoon ? (
              <p className="mt-2 text-[1rem]">Pour aujourd&apos;hui, le plus rapide est d&apos;appeler le {phoneLink}.</p>
            ) : null}
            <FieldError name="date" message={shown.date} />
          </div>

          {/* Service */}
          <fieldset aria-describedby={describedBy("service", { error: !!shown.service })}>
            <legend className="font-medium">Service</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {SERVICES.map((s) => {
                const option = live && day ? day.services[s] : undefined;
                const closed = option ? !option.available : false;
                const generic = windows.find((w) => w.service === s);
                const range = option?.available
                  ? `${timeLabel(option.open)}–${timeLabel(option.close)}`
                  : closed
                    ? "Fermé"
                    : generic
                      ? `${timeLabel(generic.open)}–${timeLabel(generic.close)}`
                      : "";
                const reasonId = `${fieldId("service")}-${s}-motif`;
                return (
                  <div key={s}>
                    <label
                      htmlFor={`${fieldId("service")}-${s}`}
                      className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[2px] border border-field px-4 py-2.5 transition-colors has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-on-navy has-[:disabled]:cursor-not-allowed has-[:disabled]:border-dashed has-[:disabled]:text-ink-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-navy has-[:focus-visible]:outline-solid"
                    >
                      <input
                        id={`${fieldId("service")}-${s}`}
                        type="radio"
                        name="service"
                        value={s}
                        required
                        checked={effService === s}
                        disabled={closed}
                        onChange={() => {
                          setService(s);
                          touch("service");
                        }}
                        onBlur={() => onBlurField("service")}
                        aria-describedby={closed ? reasonId : undefined}
                        className="size-5 shrink-0 accent-navy outline-hidden checked:accent-paper"
                      />
                      <span>
                        <span className="block font-medium">{SERVICE_LABEL[s]}</span>
                        <span className="tnum block text-[1rem]">{range}</span>
                      </span>
                    </label>
                    {closed && option && !option.available ? (
                      <p id={reasonId} className="mt-2 text-[1rem] text-ink-soft">
                        {option.reason}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <FieldError name="service" message={shown.service} />
          </fieldset>

          <div>
            <div className="grid gap-7 sm:grid-cols-2 sm:gap-6">
              {/* Arrival time */}
              <div>
                <Label name="heure">Heure d&apos;arrivée</Label>
                <SelectFrame>
                  <select
                    id={fieldId("heure")}
                    name="heure"
                    required
                    value={effHeure}
                    onChange={(e) => {
                      setHeure(e.target.value);
                      touch("heure");
                    }}
                    onBlur={() => onBlurField("heure")}
                    aria-invalid={shown.heure ? true : undefined}
                    aria-describedby={describedBy("heure", {
                      error: !!shown.heure && !tooSoon,
                      extra: tooSoon ? [`${fieldId("heure")}-appel`] : [],
                    })}
                    className={`${selectClass} tnum`}
                  >
                    <option value="">{live && !slots.length ? "Date et service d'abord" : "Choisir une heure"}</option>
                    {live
                      ? slots.map((t) => (
                          <option key={t} value={t}>
                            {timeLabel(t)}
                          </option>
                        ))
                      : windows.map((w) => (
                          <optgroup key={w.service} label={SERVICE_LABEL[w.service]}>
                            {w.slots.map((t) => (
                              <option key={t} value={t}>
                                {timeLabel(t)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                  </select>
                </SelectFrame>
                <FieldError name="heure" message={tooSoon ? undefined : shown.heure} />
              </div>

              {/* Party size */}
              <div>
                <Label name="couverts">Nombre de personnes</Label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => stepCovers(-1)}
                    aria-label="Une personne de moins"
                    aria-controls={fieldId("couverts")}
                    className={`btn btn-line min-w-12 px-0 text-[1.375rem] font-normal ${jsOnly}`}
                  >
                    −
                  </button>
                  <input
                    id={fieldId("couverts")}
                    name="couverts"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxCovers}
                    step={1}
                    required
                    value={couverts}
                    onChange={(e) => {
                      setCouverts(e.target.value);
                      setStepNote("");
                      touch("couverts");
                    }}
                    onBlur={() => onBlurField("couverts")}
                    aria-invalid={shown.couverts ? true : undefined}
                    aria-describedby={describedBy("couverts", { error: !!shown.couverts })}
                    className={`${controlBase} tnum w-20 text-center`}
                  />
                  <button
                    type="button"
                    onClick={() => stepCovers(1)}
                    aria-label="Une personne de plus"
                    aria-controls={fieldId("couverts")}
                    className={`btn btn-line min-w-12 px-0 text-[1.375rem] font-normal ${jsOnly}`}
                  >
                    +
                  </button>
                </div>
                <span aria-live="polite" className="sr-only">
                  {stepNote}
                  {live && groupOpen ? " Questions pour les groupes ajoutées après ce champ." : ""}
                </span>
                <FieldError name="couverts" message={shown.couverts} />
              </div>
            </div>

            {/* Same-day rule: under the lead time, the phone is the only way. */}
            <div aria-live="polite">
              {tooSoon ? (
                <div id={`${fieldId("heure")}-appel`} className="on-navy mt-6 bg-navy px-5 py-5 text-on-navy sm:px-6">
                  <p>{tooSoonMessage(leadMinutes)}</p>
                  <p className="mt-3">
                    <a href={`tel:${phone.e164}`} className="btn btn-solid tnum">
                      Appeler le {nobreak(phone.display)}
                    </a>
                  </p>
                </div>
              ) : null}
            </div>

            {/* Groups: always visible without JS; with JS, from the threshold on. */}
            <div
              inert={!groupOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-soft)] motion-reduce:transition-none ${groupOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} ${noJsOnly}`}
            >
              <div className="min-h-0 overflow-hidden">
                <fieldset disabled={!groupOpen} aria-describedby="reservation-groupe-aide" className="mt-8 border-t border-line pt-6">
                  <legend className="float-left w-full font-medium">Pour un groupe</legend>
                  <p id="reservation-groupe-aide" className="clear-both pt-1 text-[1rem] text-ink-soft">
                    {live ? "" : `À remplir si vous êtes ${groupThreshold} ou plus. `}
                    Vous pouvez aussi appeler le {phoneLink}.
                  </p>
                  <div className="mt-5 grid gap-6 sm:grid-cols-2">
                    <div>
                      <Label name="occasion">
                        Occasion
                        <Optional />
                      </Label>
                      <SelectFrame>
                        <select id={fieldId("occasion")} name="occasion" defaultValue="" className={selectClass}>
                          <option value="">Choisir</option>
                          {OCCASIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </SelectFrame>
                    </div>
                    <div>
                      <Label name="budget">
                        Budget par personne, en euros
                        <Optional />
                      </Label>
                      <input
                        id={fieldId("budget")}
                        name="budget"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={20}
                        className={`${controlClass} tnum mt-2 sm:max-w-48`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
                        <input type="checkbox" name="privatisation" value="oui" className="mt-1 size-5 shrink-0 accent-navy" />
                        <span>Nous souhaitons privatiser le restaurant</span>
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-12">
        <legend className={legendClass}>Vos coordonnées</legend>
        <div className="clear-both grid gap-7 pt-5 sm:grid-cols-2 sm:gap-x-6">
          <div className="sm:col-span-2">
            <Label name="nom">Nom</Label>
            <input
              id={fieldId("nom")}
              name="nom"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              required
              maxLength={120}
              onInput={() => onTextInput("nom")}
              onBlur={() => onBlurField("nom")}
              aria-invalid={shown.nom ? true : undefined}
              aria-describedby={describedBy("nom", { error: !!shown.nom })}
              className={`${controlClass} mt-2`}
            />
            <FieldError name="nom" message={shown.nom} />
          </div>
          <div>
            <Label name="telephone">Téléphone</Label>
            <input
              id={fieldId("telephone")}
              name="telephone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              maxLength={30}
              onInput={() => onTextInput("telephone")}
              onBlur={() => onBlurField("telephone")}
              aria-invalid={shown.telephone ? true : undefined}
              aria-describedby={describedBy("telephone", { hint: true, error: !!shown.telephone })}
              className={`${controlClass} tnum mt-2`}
            />
            <Hint name="telephone">Pour vous confirmer la table.</Hint>
            <FieldError name="telephone" message={shown.telephone} />
          </div>
          <div>
            <Label name="email">
              E-mail
              <Optional />
            </Label>
            <input
              id={fieldId("email")}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={200}
              onInput={() => onTextInput("email")}
              onBlur={() => onBlurField("email")}
              aria-invalid={shown.email ? true : undefined}
              aria-describedby={describedBy("email", { hint: true, error: !!shown.email })}
              className={`${controlClass} mt-2`}
            />
            <Hint name="email">Pour vous répondre par e-mail.</Hint>
            <FieldError name="email" message={shown.email} />
          </div>
          <div className="sm:col-span-2">
            <Label name="note">
              Un mot pour le restaurant
              <Optional />
            </Label>
            <textarea
              id={fieldId("note")}
              name="note"
              rows={3}
              maxLength={1000}
              placeholder="terrasse, occasion, poussette…"
              className={`${controlClass} mt-2 resize-y`}
            />
          </div>
        </div>
      </fieldset>

      {phase === "failed" ? (
        <div role="alert" className="mt-10 border-2 border-error px-5 py-5 sm:px-6">
          <p className="text-[length:var(--text-h3)] font-medium text-error">La demande n&apos;est pas partie.</p>
          <p className="mt-2">Vérifiez votre connexion et renvoyez-la, ou appelez directement le restaurant{NNBSP}:</p>
          <p className="mt-3">
            <a
              href={`tel:${phone.e164}`}
              className="tnum inline-block text-[length:var(--text-h2)] font-light leading-tight no-underline hover:underline"
            >
              {nobreak(phone.display)}
            </a>
          </p>
          <p className="mt-2 text-[1rem] text-ink-soft">Vos informations restent dans le formulaire.</p>
        </div>
      ) : null}

      <div className="mt-10">
        <button type="submit" aria-disabled={phase === "sending" ? true : undefined} className="btn btn-solid w-full sm:w-auto sm:min-w-64">
          {phase === "sending" ? "Envoi en cours…" : "Envoyer la demande"}
        </button>
        <span aria-live="polite" className="sr-only">
          {phase === "sending" ? "Envoi de la demande en cours." : ""}
        </span>
      </div>
      <p className="mt-6">{ALLERGY_LINE}</p>
      <p className="measure mt-3 text-[1rem] text-ink-soft">
        {PRIVACY_LINE}{" "}
        <Link href="/confidentialite/" className="underline">
          Confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
