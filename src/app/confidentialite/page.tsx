import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/data";
import {
  ContactEmail as Email,
  ContactPhone as Phone,
  Facts,
  LegalPage,
  LegalSection,
  LegalSubheading,
  RuledList,
  type TocEntry,
} from "@/components/legal/LegalPage";

// RGPD notice (articles 13 and 14): what the booking form collects, who receives it, how long it is
// kept, what the host logs, the click-to-load OpenStreetMap map, and why there is no cookie banner.

const UPDATED = "2026-10-07";
const description =
  "Confidentialité du site du Restaurant Comme Avant à Dardilly : données des demandes de réservation, destinataires, conservation, vos droits. Aucun cookie.";

export const metadata: Metadata = {
  title: "Confidentialité",
  description,
  alternates: { canonical: "/confidentialite/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/confidentialite/",
    title: "Confidentialité | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

const legal = site.legal;
const NETLIFY_PRIVACY = "https://www.netlify.com/privacy/";
const OSMF_PRIVACY = "https://osmfoundation.org/wiki/Privacy_Policy";
const CNIL_COMPLAINT = "https://www.cnil.fr/fr/plaintes";

const toc: TocEntry[] = [
  { id: "responsable", label: "Responsable du traitement" },
  { id: "reservation", label: "Demandes de réservation" },
  { id: "destinataires", label: "Destinataires" },
  { id: "conservation", label: "Durée de conservation" },
  { id: "journaux", label: "Journaux techniques" },
  { id: "carte-et-liens", label: "Carte interactive et liens" },
  { id: "cookies", label: "Cookies" },
  { id: "droits", label: "Vos droits" },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Confidentialité"
      intro="Ce que deviennent les informations que vous nous laissez en demandant une table, et ce que ce site ne collecte pas."
      updated={UPDATED}
      toc={toc}
    >
      <LegalSection id="responsable" title="Responsable du traitement">
        <p>
          Les données envoyées depuis ce site sont traitées par la société {legal.companyName} ({legal.legalForm}), qui
          exploite le {site.name}.
        </p>
        <Facts
          rows={[
            { label: "Société", value: `${legal.companyName}, ${legal.legalForm}` },
            { label: "Adresse", value: legal.headOffice },
            { label: "Téléphone", value: <Phone /> },
            { label: "E-mail", value: <Email /> },
          ]}
        />
      </LegalSection>

      <LegalSection id="reservation" title="Demandes de réservation">
        <p>
          Quand vous demandez une table avec le{" "}
          <Link href="/reserver/" className="underline">
            formulaire de réservation
          </Link>
          , nous recevons&#8239;:
        </p>
        <RuledList
          items={[
            "Votre nom et votre numéro de téléphone (obligatoires)",
            "Votre adresse e-mail, si vous choisissez de la donner",
            "La date, le service (midi ou soir), l'heure souhaitée et le nombre de couverts",
            "Votre message, si vous en écrivez un",
            "Pour un groupe : l'occasion, si vous souhaitez une privatisation et, si vous l'indiquez, un budget par personne",
          ]}
        />

        <LegalSubheading>À quoi elles servent</LegalSubheading>
        <p>
          Uniquement à traiter votre demande&#8239;: vous rappeler ou vous écrire pour confirmer la table, ou vous
          proposer un autre horaire, puis préparer votre venue. Elles ne servent ni à de la publicité ni à une lettre
          d&apos;information, et elles ne sont jamais vendues.
        </p>

        <LegalSubheading>Base légale</LegalSubheading>
        <p>
          Ce traitement est nécessaire pour donner suite à votre demande avant la réservation elle-même (mesures
          précontractuelles prises à votre demande, article&nbsp;6.1.b du RGPD). Sans nom ni numéro de téléphone, nous
          ne pouvons pas traiter la demande&#8239;; vous pouvez alors nous appeler au <Phone />.
        </p>
        <p>
          Le formulaire ne vous demande rien sur votre santé. Pour une allergie, dites-le-nous plutôt au téléphone ou à
          votre arrivée.
        </p>
      </LegalSection>

      <LegalSection id="destinataires" title="Destinataires">
        <p>
          Vos demandes sont lues par l&apos;équipe du restaurant, et par elle seule. Deux prestataires techniques les
          traitent pour notre compte, sans pouvoir s&apos;en servir pour eux-mêmes&#8239;:
        </p>
        <Facts
          rows={[
            {
              label: legal.host.name,
              value: (
                <>
                  Héberge le site, reçoit le formulaire et nous transmet chaque demande par e-mail. Netlify fait
                  vérifier les envois par un filtre anti-spam (Akismet, de la société Automattic). Siège&#8239;:{" "}
                  {legal.host.address}.
                </>
              ),
            },
            { label: "OVHcloud", value: "Société française qui héberge la messagerie du restaurant, où arrivent les demandes." },
          ]}
        />
        <p>
          Netlify et Automattic sont établies aux États-Unis. Ces transferts de données hors de l&apos;Union
          européenne sont encadrés par les garanties prévues par le RGPD (Data Privacy Framework ou clauses
          contractuelles types).
        </p>
      </LegalSection>

      <LegalSection id="conservation" title="Durée de conservation">
        <p>
          Chaque demande est conservée trois mois après la date de réservation demandée, puis supprimée, chez Netlify
          comme dans la messagerie du restaurant.
        </p>
      </LegalSection>

      <LegalSection id="journaux" title="Journaux techniques">
        <p>
          Comme tout hébergeur, Netlify enregistre automatiquement des informations techniques sur chaque visite,
          notamment l&apos;adresse IP, la page demandée, la date et l&apos;heure. Elles servent à faire fonctionner le
          site et à le protéger contre les abus (intérêt légitime, article&nbsp;6.1.f du RGPD). Netlify les conserve
          selon les règles de sa{" "}
          <a href={NETLIFY_PRIVACY} className="underline" rel="noopener" hrefLang="en">
            politique de confidentialité
          </a>
          .
        </p>
        <p>Nous ne nous en servons pas pour mesurer la fréquentation&#8239;: ce site n&apos;utilise aucun outil de statistiques.</p>
      </LegalSection>

      <LegalSection id="carte-et-liens" title="Carte interactive et liens">
        <p>
          La carte interactive de la page{" "}
          <Link href="/nous-trouver/" className="underline">
            Horaires et accès
          </Link>{" "}
          vient d&apos;OpenStreetMap. Elle ne s&apos;affiche que si vous cliquez pour l&apos;ouvrir. Votre navigateur se
          connecte alors aux serveurs de la Fondation OpenStreetMap (Royaume-Uni), qui reçoivent votre adresse IP,
          comme pour toute page web consultée (voir sa{" "}
          <a href={OSMF_PRIVACY} className="underline" rel="noopener" hrefLang="en">
            politique de confidentialité
          </a>
          ). Sans ce clic, rien n&apos;est chargé depuis OpenStreetMap.
        </p>
        <p>
          Les liens d&apos;itinéraire ouvrent Google Maps ou Plans d&apos;Apple, et d&apos;autres liens mènent à
          Facebook ou aux avis Google. Une fois sur ces sites, ce sont leurs propres règles de confidentialité qui
          s&apos;appliquent.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p className="text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">
          Aucun cookie soumis à consentement&#8239;: pas de bandeau.
        </p>
        <p>
          Ce site ne dépose aucun cookie ni traceur de mesure d&apos;audience, de publicité ou de réseau social. Il ne
          charge rien depuis un autre site (ni police de caractères, ni vidéo, ni bouton de partage) tant que vous ne
          cliquez pas sur un lien ou sur la carte interactive.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="Vos droits">
        <p>Pour les données vous concernant, vous pouvez demander à tout moment&#8239;:</p>
        <RuledList
          items={[
            "À y accéder et à en recevoir une copie",
            "À les faire rectifier ou effacer",
            "À limiter leur traitement ou à vous y opposer",
            "À les recevoir dans un format courant pour les transmettre à quelqu'un d'autre (portabilité)",
          ]}
        />
        <p>Vous pouvez aussi nous indiquer ce que vous souhaitez qu&apos;il advienne de ces données après votre décès.</p>
        <p>
          Écrivez-nous à <Email /> ou par courrier à {legal.companyName}, {legal.headOffice}. Nous vous répondons dans
          un délai d&apos;un mois au plus.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (
          <a href={CNIL_COMPLAINT} className="underline" rel="noopener">
            cnil.fr
          </a>
          ).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
