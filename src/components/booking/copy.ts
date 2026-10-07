// Wording shared by the booking form, its success panel and the no-JS page /reserver/merci/.
// Never say « réservation confirmée »: the restaurant confirms each request by hand.

const NNBSP = " ";

export const SENT_TITLE = "Demande envoyée, pas encore confirmée";
export const SENT_CONFIRM = "Le restaurant vous confirme votre table par téléphone ou par e-mail.";
export const SENT_FALLBACK = "Sans réponse de notre part, appelez le";

export const ALLERGY_LINE = `Une allergie${NNBSP}? Dites-le-nous au téléphone ou en arrivant.`;

/** The privacy line under the submit button; the page name « Confidentialité » is rendered as a link after it. */
export const PRIVACY_LINE = `Vos coordonnées servent uniquement à traiter votre demande (art. 6.1.b RGPD)${NNBSP}; elles sont transmises par e-mail au restaurant et supprimées au plus tard 3 mois après la date demandée. Vos droits${NNBSP}: page`;

/** Default e-mail subject (Netlify uses the field named « subject »); replaced with the details when JS runs. */
export const DEFAULT_SUBJECT = "Demande de réservation (site)";

export const OCCASIONS = ["Anniversaire", "Repas d'entreprise", "Repas de famille", "Autre"] as const;

/** Phone number that never breaks across lines. */
export const nobreak = (s: string) => s.replace(/ /g, " ");
