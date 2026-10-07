// Field checks for the booking form (pure functions, shared by blur and submit, unit-tested).
import { isTooSoon, type BookingDay } from "./schedule";

export const FIELD_ORDER = ["date", "service", "heure", "couverts", "nom", "telephone", "email"] as const;
export type FieldName = (typeof FIELD_ORDER)[number];
export type Values = Record<FieldName, string>;
export type Errors = Partial<Record<FieldName, string>>;

export type CheckContext = {
  days: BookingDay[];
  nowMs: number;
  leadMinutes: number;
  maxCovers: number;
  phone: string; // display form, e.g. "04 78 66 19 57"
};

const NNBSP = " ";

/** « moins d'une heure » for 60 minutes, « moins de 90 minutes » otherwise. */
export function leadText(minutes: number): string {
  return minutes === 60 ? "moins d'une heure" : `moins de ${minutes}${NNBSP}minutes`;
}

export function tooSoonMessage(leadMinutes: number): string {
  return `Pour une table dans ${leadText(leadMinutes)}, appelez-nous.`;
}

/** French numbers (0X XX XX XX XX) or international ones (+CC…), separators allowed. */
export function isPhone(raw: string): boolean {
  const s = raw.replace(/[\s.\-()  ]/g, "");
  return /^0\d{9}$/.test(s) || /^(\+|00)[1-9]\d{7,14}$/.test(s);
}

export function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(raw);
}

export function validateField(name: FieldName, v: Values, ctx: CheckContext): string | undefined {
  const day = ctx.days.find((d) => d.iso === v.date);
  switch (name) {
    case "date":
      if (!ctx.days.length) return `Aucune date n'est ouverte à la demande en ligne pour le moment${NNBSP}: appelez-nous au ${ctx.phone}.`;
      return day ? undefined : "Choisissez une date.";
    case "service": {
      if (!v.service) return `Choisissez le service${NNBSP}: midi ou soir.`;
      const choice = day?.services[v.service as "midi" | "soir"];
      if (choice && !choice.available) return choice.reason;
      return undefined;
    }
    case "heure":
      if (!v.heure)
        return day && v.service ? "Choisissez une heure d'arrivée." : "Choisissez d'abord la date et le service, puis l'heure d'arrivée.";
      if (isTooSoon(day, v.heure, ctx.nowMs, ctx.leadMinutes)) return tooSoonMessage(ctx.leadMinutes);
      return undefined;
    case "couverts": {
      const n = /^\d+$/.test(v.couverts) ? Number(v.couverts) : NaN;
      if (!(n >= 1)) return `Indiquez le nombre de personnes, de 1 à ${ctx.maxCovers}.`;
      if (n > ctx.maxCovers) return `Au-delà de ${ctx.maxCovers} personnes, appelez-nous au ${ctx.phone}.`;
      return undefined;
    }
    case "nom":
      return v.nom ? undefined : "Indiquez votre nom.";
    case "telephone":
      if (!v.telephone) return "Indiquez un numéro de téléphone, pour que le restaurant puisse vous confirmer la table.";
      return isPhone(v.telephone) ? undefined : `Ce numéro semble incomplet${NNBSP}: vérifiez-le (par exemple 06 12 34 56 78).`;
    case "email":
      if (!v.email) return undefined;
      return isEmail(v.email) ? undefined : `Cette adresse e-mail semble incomplète${NNBSP}: vérifiez-la (par exemple nom@exemple.fr).`;
  }
}

export function validateAll(v: Values, ctx: CheckContext): Errors {
  const errors: Errors = {};
  for (const name of FIELD_ORDER) {
    const message = validateField(name, v, ctx);
    if (message) errors[name] = message;
  }
  return errors;
}
