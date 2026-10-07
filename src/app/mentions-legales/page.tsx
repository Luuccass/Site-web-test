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
  frTypo,
  type TocEntry,
} from "@/components/legal/LegalPage";

const UPDATED = "2026-10-07";
const description =
  "Mentions légales du Restaurant Comme Avant à Dardilly : éditeur du site (LE COMPTOIR SARL), hébergeur, crédits et accessibilité.";

export const metadata: Metadata = {
  title: "Mentions légales",
  description,
  alternates: { canonical: "/mentions-legales/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/mentions-legales/",
    title: "Mentions légales | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

const legal = site.legal;
const domain = site.url.replace(/^https?:\/\//, "");
const hostDomain = legal.host.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
// LCEN also asks for the host's phone number: shown as soon as `legal.host.phone` is filled in site.config.ts.
const hostPhone = legal.host.phone;

export default function MentionsLegalesPage() {
  const mediator = legal.mediator;
  const toc: TocEntry[] = [
    { id: "editeur", label: "Éditeur du site" },
    { id: "hebergement", label: "Hébergement" },
    ...(mediator ? [{ id: "mediation", label: "Médiation de la consommation" }] : []),
    { id: "propriete", label: "Propriété intellectuelle" },
    { id: "credits", label: "Crédits" },
    { id: "accessibilite", label: "Accessibilité" },
    { id: "donnees", label: "Données personnelles" },
  ];

  return (
    <LegalPage
      title="Mentions légales"
      intro="Qui édite et héberge ce site, à qui appartiennent ses contenus, et où en est son accessibilité."
      updated={UPDATED}
      toc={toc}
    >
      <LegalSection id="editeur" title="Éditeur du site">
        <p>
          Le site {domain} est édité par la société qui exploite le {site.name}.
        </p>
        <Facts
          rows={[
            { label: "Raison sociale", value: legal.companyName },
            {
              label: "Forme juridique",
              value: `${legal.legalForm} (société à responsabilité limitée)${legal.capital ? `, au capital de ${legal.capital}` : ""}`,
            },
            { label: "Enseigne", value: site.name },
            { label: "Siège social", value: legal.headOffice },
            {
              label: "Immatriculation",
              value: (
                <>
                  {legal.rcs} <span className="tnum whitespace-nowrap">{legal.siren}</span>
                </>
              ),
            },
            { label: "SIRET", value: <span className="tnum whitespace-nowrap">{legal.siret}</span> },
            { label: "TVA intracommunautaire", value: <span className="tnum whitespace-nowrap">{legal.vat}</span> },
            { label: "Directeur de la publication", value: legal.publicationDirector },
            { label: "Téléphone", value: <Phone /> },
            { label: "E-mail", value: <Email /> },
          ]}
        />
        <p className="text-ink-soft">
          Informations publiées en application de la loi n°&nbsp;2004-575 du 21&nbsp;juin 2004 pour la confiance dans
          l&apos;économie numérique.
        </p>
      </LegalSection>

      <LegalSection id="hebergement" title="Hébergement">
        <p>Le site et son formulaire de réservation sont hébergés par&#8239;:</p>
        <Facts
          rows={[
            { label: "Hébergeur", value: legal.host.name },
            { label: "Adresse", value: legal.host.address },
            ...(hostPhone ? [{ label: "Téléphone", value: <span className="tnum whitespace-nowrap">{hostPhone}</span> }] : []),
            {
              label: "Site",
              value: (
                <a href={legal.host.url} className="underline" rel="noopener">
                  {hostDomain}
                </a>
              ),
            },
          ]}
        />
      </LegalSection>

      {mediator ? (
        <LegalSection id="mediation" title="Médiation de la consommation">
          <p>
            En cas de litige avec le restaurant que nous n&apos;avons pas pu régler ensemble, vous pouvez saisir
            gratuitement le médiateur de la consommation dont nous relevons (articles L.&nbsp;612-1 et suivants du Code
            de la consommation)&#8239;:
          </p>
          <Facts
            rows={[
              { label: "Médiateur", value: mediator.name },
              { label: "Adresse", value: mediator.address },
              {
                label: "Site",
                value: (
                  <a href={mediator.url} className="underline [overflow-wrap:anywhere]" rel="noopener">
                    {mediator.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                ),
              },
            ]}
          />
          <p>
            Avant de le saisir, adressez-nous d&apos;abord une réclamation écrite, par e-mail à <Email /> ou par
            courrier à notre siège.
          </p>
        </LegalSection>
      ) : null}

      <LegalSection id="propriete" title="Propriété intellectuelle">
        <p>
          Les textes, les photographies et le logo de ce site sont protégés par le droit d&apos;auteur. Ils ne
          peuvent pas être reproduits ni réutilisés, en tout ou en partie, sans notre accord écrit.
        </p>
        <p>Vous pouvez bien sûr imprimer ou télécharger la carte et la carte des vins pour votre usage personnel.</p>
      </LegalSection>

      <LegalSection id="credits" title="Crédits">
        <RuledList items={legal.credits.map((credit) => frTypo(credit))} />
      </LegalSection>

      <LegalSection id="accessibilite" title="Accessibilité">
        <p>Ce site vise le niveau AA des règles internationales d&apos;accessibilité WCAG&nbsp;2.2.</p>

        <LegalSubheading>Vérifications</LegalSubheading>
        <p>
          En octobre 2026, le site a été contrôlé avec des outils automatiques (axe et Lighthouse) et vérifié
          à la navigation au clavier. Il n&apos;a pas fait l&apos;objet d&apos;un audit complet&#8239;: nous ne déclarons
          donc aucun niveau de conformité.
        </p>

        <LegalSubheading>Limites connues</LegalSubheading>
        <RuledList
          items={[
            <>
              Les versions PDF de la carte et de la carte des vins ne sont pas entièrement lisibles par les lecteurs
              d&apos;écran. Le même contenu est disponible en texte sur les pages{" "}
              <Link href="/la-carte/" className="underline">
                La carte
              </Link>{" "}
              et{" "}
              <Link href="/la-carte/vins/" className="underline">
                Les vins
              </Link>
              .
            </>,
            <>
              La carte interactive de la page{" "}
              <Link href="/nous-trouver/" className="underline">
                Horaires et accès
              </Link>{" "}
              peut être difficile à utiliser au clavier ou avec un lecteur d&apos;écran. Elle est facultative&#8239;:
              l&apos;adresse, l&apos;itinéraire et les indications d&apos;accès sont écrits sur la même page.
            </>,
          ]}
        />

        <LegalSubheading>Besoin d&apos;aide&#8239;?</LegalSubheading>
        <p>
          Si un contenu vous pose problème, appelez-nous au <Phone />&#8239;: nous pouvons vous lire la carte au
          téléphone. Vous pouvez aussi nous écrire à <Email /> en indiquant la page concernée.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="Données personnelles">
        <p>
          Ce que nous faisons des informations envoyées par le formulaire de réservation, et pourquoi ce site
          n&apos;affiche pas de bandeau cookies&#8239;: tout est expliqué sur la page{" "}
          <Link href="/confidentialite/" className="underline">
            Confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
